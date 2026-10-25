# CLAUDE.md — Instructions for Working on This Repo

This file tells Claude (or any future AI assistant) how to work on the
**One Love One Heart e.V.** website in this repo. Read this before making any
changes. It complements `README.md` (which explains the site's technical
structure) — this file is about *process and standing rules*.

---

## 1. Golden rule: do not change the theme

**Never change colors, fonts, layout system, spacing scale, or overall visual
design unless the owner explicitly asks for it.**

- Colors live in `assets/css/main.css` under the `:root { ... }` block
  (`--sand`, `--brown`, etc.). Do not touch these for content updates.
- Fonts are Playfair Display (headings) + Open Sans (body) — do not change.
- Reuse existing CSS classes and patterns (`section--sand`, `section--sand-dark`,
  `section--white`, `section--brown`, `grid-2`, `grid-3`, `project-cards`,
  `donate-section`, `.btn btn-primary/btn-outline/btn-white`, etc.) instead of
  inventing new styles. If a new pattern is truly needed, keep it minimal,
  scoped to the page (inline `<style>` in that page's `<head>`, like
  `pages/projekte/gesundheit/index.html` does for `.photo-placeholder`,
  `.story-name`, `.diagnosis-badge`), and consistent with the existing look.
- Content updates = text, images, links, new sections/pages using the
  existing design language. Redesigns = ask first.

## 2. Content updates come from the owner as German Word/PDF documents

The NGO owner (Annette) sends content updates as German `.docx`/`.pdf`
documents (dropped into `changes/` in past rounds — check that folder first,
it may contain the latest batch of source docs). Workflow for every such
update:

1. **Read the German source doc(s) in full** before editing any HTML.
2. **Keep the German text as-is** (verbatim, just clean up obvious typos/
   spacing) — it goes into `data-de="..."` attributes and the visible
   fallback text between tags (the site defaults to German for users with
   JS disabled).
3. **Translate to English** for the `data-en="..."` attribute. Keep the
   translation natural, not overly literal — match the tone of the existing
   English copy already in the codebase (warm, direct, NGO-appropriate).
4. **Every piece of translatable text needs three copies in sync**: the
   `data-de` attribute, the `data-en` attribute, and the fallback text
   between the opening/closing tag (always German, matches `data-de`).
   Example:
   ```html
   <p data-de="Hallo Welt" data-en="Hello World">Hallo Welt</p>
   ```
5. **`data-de`/`data-en` attributes must be plain text only — no HTML
   tags** (no `<br>`, no `<strong>`, etc.). The language-switcher JS
   (`assets/js/main.js`) sets `el.textContent`, so any markup inside the
   attribute would render as literal text. If you need a line break inside
   translated copy, either split into multiple `<p>` tags or accept that the
   text wraps naturally.
6. **Figure out which existing page the content belongs to** before creating
   a new one — most content documents map to an existing page:
   - "Aktuelles" doc → `pages/aktuelles/index.html`
   - "Produkte" doc → `pages/produkte/index.html`
   - "Spenden" doc → `pages/spenden/index.html`
   - "Patenschaften, Schule und Bildung" doc → `pages/projekte/schule/index.html`
   - "Gesundheit und Ernährung" doc → `pages/projekte/gesundheit/index.html`
   - "Main Project ILA SINNING" doc → `pages/projekte/ila-sinning/index.html`
   - "Beitrittserklärung" (membership form) → linked from
     `pages/mitmachen/index.html`, PDF stored in `assets/downloads/`
   Only create a new page (see README §4) if the content genuinely doesn't
   fit any existing page/section.
7. Update **both** the DE and EN meta `<title>`/`<meta description>` only if
   the page's core topic changed — usually not needed for a content tweak.

## 3. Photos

- Many content documents from the owner reference photos that are **not
  yet available** as files (they're described as "Foto von Marion", "Foto
  kommt noch", embedded in the Word doc, etc.). **Do not fabricate or
  reuse an unrelated real photo with a caption that misrepresents it.**
- When a real photo isn't available, use a clearly-marked placeholder
  instead of a mismatched stock photo:
  - For card grids (`project-card__img-wrap`): a `<div>` with
    `background:var(--sand-dark)`, centered emoji, matching the pattern
    already used on `pages/mitmachen/index.html` and now on the ILA SINNING
    start-ups and Aktuelles container news.
  - For story/testimonial-style sections: the dashed-border
    `.photo-placeholder` component defined in
    `pages/projekte/gesundheit/index.html` (with the "Foto von ..." label).
- **Always tell the owner explicitly which real photos are still needed**
  and where they'll go (file path + page) so she/Marion can supply them.
  Once supplied: drop them in `assets/images/` (see naming convention in
  README §9: `photo-[description]-[year].jpg`), then swap the placeholder
  `<div>`/`.photo-placeholder` for a real `<img>` with proper `alt` text.
- Never publish real medical images (X-rays, wounds, surgical photos) or
  other especially sensitive photos of identifiable minors without
  explicit confirmation from the owner that she has consent and wants that
  specific image published. When in doubt, ask instead of guessing.

## 4. Every page's footer must stay identical

All pages share the same footer markup (brand column, Seiten/Pages,
Rechtliches/Legal with Impressum + Datenschutz, Kontakt). When adding a new
page, copy the footer from a **known-good** page (`index.html` or
`pages/aktuelles/index.html`) — not from `pages/wer-wir-sind/`,
`pages/mitmachen/`, `pages/produkte/`, or `pages/spenden/`'s history, which
previously had a truncated/broken Legal column (missing the closing
`</a></li></ul>` after the Datenschutz link) until the August 2026 content
update fixed it. If you ever see a footer's Legal column end abruptly right
after `href="../datenschutz/index.html"` with no `data-de`/`data-en`/link
text, that's the same bug — fix it the same way.

Footer links are relative, so they must be adjusted to the page's depth when
copying the footer: `pages/projekte/index.html` from the root `index.html`
becomes `../../pages/projekte/index.html` from `pages/aktuelles/` and
`../../../pages/projekte/index.html` from `pages/projekte/schule/` (same for
`assets/...` image paths). Until October 2026 the "Seiten" links on 11
subpages were copied unadjusted from `index.html` and led to 404s;
`tests/check_site.py` now catches this.

## 5. Git workflow

0. **Commit identity for this repo only:** all commits must use
   `abhijeet.rai101@gmail.com` (name `RaiAbhijeet`). Set it with
   `git config --local user.email "abhijeet.rai101@gmail.com"` — **never**
   with `--global`, because the developer uses a different email for other
   git projects on the same machine. Before committing, check
   `git config --local user.email`; if it's empty or different, set it
   locally first. Never pass `--author` or change the global config to work
   around it.
1. **Never commit content changes directly to `main`.** Create a feature
   branch first, e.g. `content-update-<short-date-or-topic>`.
2. Make all edits on that branch.
3. Run the automated checks: `python tests/check_site.py` (stdlib only, no
   install). It fails on broken internal links/images, unclosed tags,
   unpaired or HTML-containing `data-de`/`data-en`, incomplete footers and
   sitemap URLs that don't exist; WARNINGs (fallback text ≠ `data-de`) are
   worth fixing but don't fail. The same script runs automatically:
   - **locally on every commit** once you've run
     `git config core.hooksPath .githooks` in your clone;
   - **on GitHub** (`.github/workflows/site-checks.yml`) on every push to
     any branch, on every PR into `main`, and after merging into `main`.
     Don't merge a PR whose "Site checks" run is red.
4. Then test manually (see README — no build step; open `index.html`
   directly in a browser, or run a tiny static server, e.g.
   `python -m http.server` from the repo root, then click through every
   changed page in both DE and EN). Check:
   - Both language toggles (top-right DE/EN buttons) on every page you
     touched.
   - All links you added/changed actually resolve (relative path depth
     matters — count `../` carefully, see README §4).
   - Footer renders fully and identically on every page.
   - No layout breakage / no visual theme drift.
5. Report back to the owner what changed and how to test it, and only merge
   to `main` after she confirms it looks right (either she reviews the
   branch/PR, or explicitly tells you to merge).
6. Use descriptive commit messages (what content changed, which page).
7. Before starting, `git fetch` and branch from the current `origin/main` —
   the live site is sometimes edited directly on GitHub (e.g. the topbar
   email change in October 2026).

## 6. Reference info (source of truth lives in the code, but noted here since it's not obvious from files alone)

- Contact email used sitewide: `ilasinning@yahoo.com` (confirmed October
  2026 — the old `ilasinning@yahoo.de` is wrong and must not come back).
- Legal address: Wiesenstr. 17, 58452 Witten (see `Beitrittserklärung.pdf`)
- Org name in full: "One Love – One Heart e.V. — Gambia – Gomera – Germany"
- The `changes/` folder is a scratch/inbox area for source documents the
  owner supplies — it's in `.gitignore`, so its contents never reach the
  repo. Treat them as **input**, not something to link to or publish
  directly, and empty the folder once a batch is live (the one exception
  made so far: the blank `Beitrittserklärung.pdf` membership-application
  template, which is a distributable form with no personal data in it,
  copied to `assets/downloads/Beitrittserklaerung-One-Love-One-Heart.pdf` —
  not linked from any page yet; it's meant for the Mitmachen page).

---

_Keep this file up to date if the workflow changes. Last updated: August 2026
during the first German-content sync (Aktuelles, Produkte, Spenden,
Patenschaften/Schule/Bildung, Gesundheit/Ernährung, ILA SINNING,
Beitrittserklärung); October 2026: added automated site checks, fixed
footer link depth._
