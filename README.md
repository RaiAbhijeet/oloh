# One Love One Heart e.V. — Website Documentation

**NGO Website** | Static HTML/CSS/JS | Hosted on GitHub Pages | Protected by Cloudflare

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [How to Edit Content](#2-how-to-edit-content)
3. [How to Add a New Section](#3-how-to-add-a-new-section)
4. [How to Add a New Page](#4-how-to-add-a-new-page)
5. [How to Remove a Page](#5-how-to-remove-a-page)
6. [Language Switcher (DE/EN)](#6-language-switcher-deen)
7. [How to Deploy to GitHub Pages](#7-how-to-deploy-to-github-pages)
8. [How to Connect Cloudflare](#8-how-to-connect-cloudflare)
9. [Adding Real Photos](#9-adding-real-photos)

---

## 1. Project Structure

```
oloh/
│
├── index.html                  ← HOMEPAGE (main entry point)
│
├── assets/
│   ├── css/
│   │   └── main.css            ← All site CSS
│   ├── js/
│   │   └── main.js             ← Main JS: nav, scroll reveal, language, lightbox
│   └── images/
│       ├── LogoBG.png
│       ├── photo-schule-bildung.jpg
│       ├── photo-fruits.jpg
│       ├── photo-jars.jpg
│       ├── photo-cooking.jpg
│       └── ...
│
├── pages/
│   ├── projekte/
│   │   ├── index.html          ← Projects overview page
│   │   ├── schule/
│   │   │   └── index.html      ← School project detail page
│   │   ├── gesundheit/
│   │   │   └── index.html      ← Health & nutrition project detail page
│   │   ├── grundstueck/
│   │   │   └── index.html      ← Land & culture project detail page
│   │   └── ila-sinning/
│   │       └── index.html      ← Women's project detail page
│   ├── spenden/
│   │   └── index.html          ← Donations page
│   ├── aktuelles/
│   │   └── index.html          ← News page
│   ├── produkte/
│   │   └── index.html          ← Products page
│   ├── wer-wir-sind/
│   │   └── index.html          ← About page
│   └── mitmachen/
│       └── index.html          ← Get involved page
│
├── docs/
│   └── project-subproject-tree-map.md  ← Project/subproject page map
│
└── README.md                   ← This file
```

---

## 2. How to Edit Content

### Change text on any page

Open the relevant `.html` file and look for the text you want to change.

All bilingual text uses `data-de="..."` and `data-en="..."` attributes:

```html
<h2 data-de="Unsere Projekte" data-en="Our Projects">Unsere Projekte</h2>
```

Edit both attributes AND the fallback text between the tags.

### Change the hero background image

In `index.html`, find the `.hero-bg` div:

```html
<div
  class="hero-bg"
  style="background-image: url('assets/images/photo-fruits.jpg');"
></div>
```

Replace `photo-fruits.jpg` with any image from `assets/images/`.

### Change NGO name, email, or phone

Search for `info@oneloveoneheart.com` and `0176 111 111 111` across all HTML files and replace.

### Change colors sitewide

Open `assets/css/main.css` and edit the `:root` block at the top:

```css
:root {
  --sand: #f5f0e8; /* main background */
  --brown: #8b6914; /* accent color */
  /* ... etc */
}
```

### Add a news article (Aktuelles)

Open `pages/aktuelles/index.html`, find the `project-cards` div, and copy-paste an `<article>` block.

### Add a product (Produkte)

Open `pages/produkte/index.html`, find the `project-cards` div, and copy-paste an `<article>` block.

### Update donation links (Spenden)

Open `pages/spenden/index.html`:

- Replace `DE[XX XXXX XXXX XXXX XXXX XX]` with real IBAN
- Replace the PayPal `hosted_button_id=XXXXXXXXXX` with real button ID
- Replace eBay charity link with real URL

---

## 3. How to Add a New Section

To add a section to any page, insert this template block:

```html
<!-- ═══ SECTION: [Your Section Name] ═══ -->
<section class="section section--sand" id="your-section-id">
  <div class="container">
    <!-- Section header -->
    <div class="text-center" style="margin-bottom:2.5rem;">
      <span class="section-label" data-de="Kategorie DE" data-en="Category EN"
        >Kategorie</span
      >
      <h2 data-de="Überschrift DE" data-en="Heading EN">Überschrift</h2>
      <p data-de="Beschreibung DE" data-en="Description EN">Beschreibung</p>
    </div>

    <!-- Your content goes here -->
    <div class="grid-2">
      <!-- or grid-3 for 3 columns -->
      <div class="reveal">
        <!-- Left content -->
      </div>
      <div class="reveal">
        <!-- Right content -->
      </div>
    </div>
  </div>
</section>
```

**Available section background classes:**

- `section--sand` — warm sandy background (default)
- `section--sand-dark` — slightly darker sand
- `section--white` — pure white
- `section--brown` — dark brown (for CTAs)

---

## 4. How to Add a New Page

**Step 1** — Create the folder and file:

```
pages/new-page/index.html
```

**Step 2** — Copy the structure from an existing page (e.g. `pages/aktuelles/index.html`)

**Step 3** — Update the CSS/JS paths (count `../` relative to root):

```html
<link rel="stylesheet" href="../../assets/css/main.css" />
<script src="../../assets/js/main.js"></script>
<img src="../../assets/images/logo.png" ... />
```

For nested pages inside `pages/projekte/<project>/`, add one more `../`:

```html
<link rel="stylesheet" href="../../../assets/css/main.css" />
<script src="../../../assets/js/main.js"></script>
<img src="../../../assets/images/logo.png" ... />
```

**Step 4** — Add the page to the nav in EVERY `.html` file:

```html
<li>
  <a href="pages/new-page/index.html" data-de="Neue Seite" data-en="New Page"
    >Neue Seite</a
  >
</li>
```

For pages inside `/pages/`, use relative paths like `../new-page/index.html`.

**Step 5** — Add it to the footer links in `index.html`.

---

## 5. How to Remove a Page

1. Delete the page folder: `pages/the-page/`
2. Remove its `<li><a>` from the nav in ALL html files
3. Remove it from the footer in `index.html`

---

## 6. Language Switcher (DE/EN)

The site supports German/English switching with zero JavaScript frameworks.

**How it works:**

1. Add `data-de="..."` and `data-en="..."` to any element
2. The JS reads these on load and on toggle
3. Language preference is saved in `localStorage`

**Example:**

```html
<p data-de="Hallo Welt" data-en="Hello World">Hallo Welt</p>
```

**Fallback:** The visible text between tags is shown before JS loads (always set to German).

---

## 7. How to Deploy to GitHub Pages

**Option A — Drag & Drop (no terminal needed):**

1. Go to github.com → Create new repository named `oneloveoneheart`
2. Click "uploading an existing file"
3. Drag the entire `oloh/` folder contents (not the folder itself)
4. Click "Commit changes"
5. Go to Settings → Pages → Source: `main` branch → `/root`
6. Site live at: `https://yourusername.github.io/oneloveoneheart`

**Option B — Git (recommended for ongoing updates):**

```bash
cd oloh/
git init
git add .
git commit -m "Initial website"
git remote add origin https://github.com/yourusername/oneloveoneheart.git
git push -u origin main
```

Then enable GitHub Pages in repo Settings.

**For future updates:**

```bash
# Edit files, then:
git add .
git commit -m "Updated news section"
git push
```

Site updates automatically within ~60 seconds.

---

## 8. How to Connect Cloudflare

1. Register your domain (e.g. `oneloveoneheart.de`) at any registrar
2. Sign up free at cloudflare.com → Add your domain
3. Cloudflare scans your DNS and shows existing records
4. Add a CNAME record:
   - **Name:** `www`
   - **Target:** `yourusername.github.io`
5. Add an A record or ALIAS for root domain pointing to GitHub Pages IPs:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
6. Set nameservers at your registrar to Cloudflare's nameservers
7. In GitHub repo Settings → Pages → Custom domain: enter your domain
8. Enable "Enforce HTTPS" in GitHub Pages settings
9. In Cloudflare: SSL/TLS → set to "Full" mode
10. Enable "Always use HTTPS" in Cloudflare SSL settings

**Free Cloudflare protections enabled automatically:**

- DDoS protection
- CDN (faster worldwide loading)
- SSL certificate
- Bot protection (basic)
- Web Application Firewall (free rules)

---

## 9. Adding Real Photos

1. Place new photos in `assets/images/`
2. Recommended: compress images before uploading (use squoosh.app — free)
3. Recommended dimensions: hero images 1920×1080px, card images 800×600px
4. Update the `src` attribute and `alt` text in the relevant HTML file

**Photo naming convention:**

```
photo-[description]-[year].jpg
e.g. photo-annette-schule-2025.jpg
```

**The grayscale hover effect is automatic** — any image inside `.project-card__img-wrap` or `.ila-img-wrap` starts grayscale and goes color on hover. No extra code needed.

---

## Notes for Developers

- No build step required — open `index.html` directly in browser to preview
- CSS uses custom properties (variables) for easy theming
- JS is vanilla — no jQuery, no frameworks
- All sections have `id` attributes for anchor linking
- Comments in HTML clearly mark where to add/edit content
- `reveal` class on any element triggers scroll animation automatically

---

_One Love One Heart e.V. — Berlin & Gambia_
