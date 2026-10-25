#!/usr/bin/env python3
"""
Static checks for the One Love One Heart website.

No dependencies (Python 3.9+ standard library only). Run from anywhere:

    python tests/check_site.py

Exits with code 1 if any ERROR is found; WARNINGs are printed but don't fail.

Checks (see CLAUDE.md for the rules behind them):
  1. HTML is well-formed enough: every opened non-void tag is closed in order.
  2. Every internal href/src points to a file that exists in the repo.
  3. Bilingual text: data-de and data-en always come in pairs, are non-empty
     and contain no HTML tags (main.js sets textContent, so markup would show
     up as literal text). Fallback text that differs from data-de -> WARNING.
  4. Every page has <html lang>, <title>, main.css, main.js and the full
     footer (brand + Seiten + Rechtliches with Impressum/Datenschutz + Kontakt).
  5. Every <loc> in sitemap.xml maps to an existing file.
"""

import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://oneloveoneheart.org/"

# Folders that are never published / not part of the site.
SKIP_DIRS = {".git", ".github", "changes", "node_modules", "tests"}

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}
# Tags whose end tag the HTML spec lets you omit — don't flag those.
OPTIONAL_END_TAGS = {"li", "p", "td", "th", "tr", "option", "dt", "dd"}

EXTERNAL_SCHEMES = ("http:", "https:", "mailto:", "tel:", "javascript:", "data:", "//")
# Served by Cloudflare in production, not by files in the repo.
CLOUDFLARE_PREFIX = "/cdn-cgi/"

errors: list[str] = []
warnings: list[str] = []


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def norm_ws(text: str) -> str:
    return " ".join(text.split())


class PageParser(HTMLParser):
    def __init__(self, path: Path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.stack: list[tuple[str, int]] = []
        self.links: list[tuple[str, int]] = []
        self.has_lang = False
        self.has_title = False
        self.css: set[str] = set()
        self.js: set[str] = set()
        # Bilingual elements whose fallback text we're collecting.
        self.i18n_open: list[dict] = []
        # Footer tracking.
        self.footer_depth = 0
        self.footer_text: list[str] = []
        self.footer_hrefs: list[str] = []
        self.footer_cols = 0
        self.footer_brand = False

    # -- helpers ----------------------------------------------------------
    def _err(self, msg: str, line: int | None = None):
        line = line if line is not None else self.getpos()[0]
        errors.append(f"{rel(self.path)}:{line}: {msg}")

    def _warn(self, msg: str, line: int | None = None):
        line = line if line is not None else self.getpos()[0]
        warnings.append(f"{rel(self.path)}:{line}: {msg}")

    # -- parser callbacks -------------------------------------------------
    def handle_starttag(self, tag, attrs):
        self._start(tag, attrs, self_closing=False)

    def handle_startendtag(self, tag, attrs):
        self._start(tag, attrs, self_closing=True)

    def _start(self, tag, attrs, self_closing):
        line = self.getpos()[0]
        a = dict(attrs)

        if tag == "html" and a.get("lang"):
            self.has_lang = True
        if tag == "title":
            self.has_title = True

        for attr in ("href", "src"):
            if a.get(attr) is not None:
                self.links.append((a[attr], line))
        if tag == "link" and "stylesheet" in (a.get("rel") or ""):
            self.css.add(Path(a.get("href", "")).name)
        if tag == "script" and a.get("src"):
            self.js.add(Path(a["src"]).name)

        # Bilingual attributes
        de, en = a.get("data-de"), a.get("data-en")
        if (de is None) != (en is None):
            missing = "data-en" if en is None else "data-de"
            self._err(f"<{tag}> has {'data-de' if en is None else 'data-en'} but no {missing}")
        if de is not None and en is not None:
            for name, val in (("data-de", de), ("data-en", en)):
                if not val.strip():
                    self._err(f"<{tag}> {name} is empty")
                if re.search(r"<\s*/?\s*[a-zA-Z][^>]*>", val):
                    self._err(f"<{tag}> {name} contains HTML markup (shown as literal text): {val[:60]!r}")
            if tag not in VOID_TAGS and not self_closing:
                self.i18n_open.append({"tag": tag, "de": de, "line": line,
                                       "depth": len(self.stack), "text": []})

        # Footer
        classes = (a.get("class") or "").split()
        if tag == "footer":
            self.footer_depth += 1
        if self.footer_depth:
            if "footer-col" in classes:
                self.footer_cols += 1
            if "footer-brand" in classes:
                self.footer_brand = True
            if tag == "a" and a.get("href"):
                self.footer_hrefs.append(a["href"])

        if tag not in VOID_TAGS and not self_closing:
            self.stack.append((tag, line))

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
        line = self.getpos()[0]
        if not any(t == tag for t, _ in self.stack):
            self._err(f"stray closing tag </{tag}>", line)
            return
        # Pop until we find the matching tag; anything skipped was left open.
        while self.stack:
            open_tag, open_line = self.stack.pop()
            self._close_i18n()
            if open_tag == tag:
                break
            if open_tag not in OPTIONAL_END_TAGS:
                self._err(f"<{open_tag}> opened on line {open_line} is not closed before </{tag}>", line)
        if tag == "footer":
            self.footer_depth -= 1

    def _close_i18n(self):
        if self.i18n_open and self.i18n_open[-1]["depth"] == len(self.stack):
            item = self.i18n_open.pop()
            fallback = norm_ws("".join(item["text"]))
            if fallback != norm_ws(item["de"]):
                self._warn(
                    f"<{item['tag']}> fallback text differs from data-de "
                    f"(fallback={fallback[:50]!r}, data-de={norm_ws(item['de'])[:50]!r})",
                    item["line"],
                )

    def handle_data(self, data):
        for item in self.i18n_open:
            item["text"].append(data)
        if self.footer_depth:
            self.footer_text.append(data)

    def close(self):
        super().close()
        for tag, line in self.stack:
            if tag not in OPTIONAL_END_TAGS:
                self._err(f"<{tag}> opened on line {line} is never closed", line)


def resolve_local(page: Path, url: str) -> Path | None:
    """Return the file an internal URL points to, or None if it's external/anchor-only."""
    url = url.strip()
    if (not url or url.startswith("#") or url.lower().startswith(EXTERNAL_SCHEMES)
            or url.startswith(CLOUDFLARE_PREFIX)):
        return None
    path = unquote(urlparse(url).path)
    if not path:
        return None
    target = (ROOT / path.lstrip("/")) if path.startswith("/") else (page.parent / path)
    if path.endswith("/") or target.is_dir():
        target = target / "index.html"
    return target


def check_page(page: Path):
    parser = PageParser(page)
    parser.feed(page.read_text(encoding="utf-8"))
    parser.close()

    for url, line in parser.links:
        target = resolve_local(page, url)
        if target is None:
            continue
        try:
            target.resolve().relative_to(ROOT)
        except ValueError:
            errors.append(f"{rel(page)}:{line}: link points outside the site: {url}")
            continue
        if not target.is_file():
            errors.append(f"{rel(page)}:{line}: broken link: {url}")

    name = rel(page)
    if not parser.has_lang:
        errors.append(f"{name}: <html> has no lang attribute")
    if not parser.has_title:
        errors.append(f"{name}: missing <title>")
    if "main.css" not in parser.css:
        errors.append(f"{name}: doesn't include assets/css/main.css")
    if "main.js" not in parser.js:
        errors.append(f"{name}: doesn't include assets/js/main.js (language switcher)")

    # Footer completeness (CLAUDE.md §4)
    footer_text = norm_ws(" ".join(parser.footer_text))
    if not footer_text:
        errors.append(f"{name}: missing <footer>")
    else:
        if not parser.footer_brand:
            errors.append(f"{name}: footer is missing the brand column")
        if parser.footer_cols < 3:
            errors.append(f"{name}: footer has {parser.footer_cols} columns, expected 3 (Seiten, Rechtliches, Kontakt)")
        for label in ("Seiten", "Rechtliches", "Impressum", "Datenschutz", "Kontakt"):
            if label not in footer_text:
                errors.append(f"{name}: footer is missing '{label}'")
        targets = {resolve_local(page, h) for h in parser.footer_hrefs}
        targets = {t.resolve() for t in targets if t is not None}
        for slug in ("impressum", "datenschutz"):
            if (ROOT / "pages" / slug / "index.html").resolve() not in targets:
                errors.append(f"{name}: footer has no link to the {slug} page")


def check_sitemap():
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.is_file():
        warnings.append("sitemap.xml: not found")
        return
    try:
        tree = ET.parse(sitemap)
    except ET.ParseError as e:
        errors.append(f"sitemap.xml: invalid XML: {e}")
        return
    for loc in tree.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
        url = (loc.text or "").strip()
        if not url.startswith(SITE_URL):
            errors.append(f"sitemap.xml: URL not on {SITE_URL}: {url}")
            continue
        path = url[len(SITE_URL):] or "index.html"
        target = ROOT / unquote(path)
        if path.endswith("/") or target.is_dir():
            target = target / "index.html"
        if not target.is_file():
            errors.append(f"sitemap.xml: {url} -> {rel(target)} does not exist")


def main() -> int:
    # Windows consoles default to cp1252, which mangles umlauts in the report.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    pages = sorted(
        p for p in ROOT.rglob("*.html")
        if not SKIP_DIRS.intersection(p.relative_to(ROOT).parts)
    )
    for page in pages:
        check_page(page)
    check_sitemap()

    for w in warnings:
        print(f"WARNING {w}")
    for e in errors:
        print(f"ERROR   {e}")
    print(f"\nChecked {len(pages)} pages: {len(errors)} error(s), {len(warnings)} warning(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
