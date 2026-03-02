# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static multilingual website for Pauline Service — personal assistance in Nontron, Dordogne. No build tools, no package manager. Pure HTML/CSS/JS.

## Development

Serve locally with any static server:
```bash
python3 -m http.server 8000
# or
npx serve .
```

Deploy: push to `master` — GitHub Actions (`.github/workflows/static.yml`) deploys to GitHub Pages automatically.

## Committing

Use the custom commit helper:
```bash
bash ~/Documents/Code/Helpers/smart_commit.sh "message"
```

## Architecture

```
index.html          # Main page (services, about, contact, testimonials)
privacy.html        # Legal — content rendered from privacy_content translation key
terms.html          # Legal — content rendered from terms_content translation key
script.js           # Mobile menu, parallax, service card overlays, form validation
styles.css          # Single CSS file, CSS variables in :root
worker.ts           # Cloudflare Worker: receives form POST → Mailjet API
assets/
  js/i18n.js        # i18n engine (no deps)
  lang/en.json      # 95 translation keys (EN)
  lang/fr.json      # 95 translation keys (FR)
  images/uk.png     # Language switcher flags
  images/fr.png
```

## i18n System

- **Engine**: `assets/js/i18n.js` — fetches `assets/lang/{lang}.json` on load
- **Lang detection order**: `localStorage['siteLang']` → `navigator.languages[0]` → `navigator.language` → `"en"`
- **DOM binding**: add `data-i18n="key"` to any element → sets `textContent` or `innerHTML` (auto-detected by checking for HTML tags in value)
- **Inputs**: `data-i18n-placeholder="key"` for placeholders; `type="button|submit"` inputs set via `value`
- **Flag switcher**: buttons with `data-lang="en|fr"` → saves to localStorage, reloads page. Active flag gets `lang-active` class (amber border), inactive gets `lang-inactive` (opacity 0.4)
- **Custom event**: `i18nApplied` fires on `document` with `{ lang }` after translations are applied

Adding a new translation key: add to both `en.json` and `fr.json`, then add `data-i18n="key"` in the HTML.

Legal page content (`privacy_content`, `terms_content`) is stored as full HTML blocks in the JSON files and injected via `innerHTML`.

## Contact Form Backend

`worker.ts` is a Cloudflare Worker deployed separately. It requires these environment variables (set in the Cloudflare dashboard):
- `MJ_CONTACT_EMAIL` — destination address
- `MJ_PUBLIC_KEY` / `MJ_PRIVATE_KEY` — Mailjet credentials

## Key Conventions

- **CSS variables** defined in `:root` in `styles.css`: `--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-primary-lightest`, neutral grays, shadows, border radii
- **Phone/email** displayed via canvas+base64 obfuscation (anti-scraper) — do not replace with plain text
- **Translation key naming**: `nav_*`, `svc_{name}_{title|summary|detail}`, `about_*`, `who_*`, `form_*`, `footer_*`, `contact_*`
- `svc_*_detail` values are HTML `<ul>` lists (use `innerHTML`)
