# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **RB Flex**, a Chilean hydraulic repair company. Zero dependencies — pure HTML5, CSS3, and vanilla JavaScript (ES6+). No build step, no bundler, no framework.

## Development Server

```bash
python -m http.server 5500
```

Serves the site at `http://localhost:5500`. No build or install required.

## Architecture

Single-page site — all content lives in `index.html` with anchor-based navigation. The three root files are the entire codebase:

- `index.html` — markup, SEO metadata (OG tags, JSON-LD schema), 10 sections
- `styles.css` — all styles (~928 lines); uses CSS custom properties for theming; 4 breakpoints: 1600px, 1300px, 900px, 600px
- `main.js` — all interactivity (~257 lines); fully vanilla, wrapped in an IIFE

### JavaScript modules (all in `main.js`)

1. **Scroll reveal** — `IntersectionObserver` adds `.visible` to elements; cascade via `.reveal-delay-1/2/3` classes
2. **Navbar** — glass blur applied when `scrollY > 30`; active link highlight tracks current section
3. **Infinite slider** — first/last slides are cloned for seamless loop; guarded against mid-transition clicks (see FIX 1–3 comments); auto-play pauses via Page Visibility API
4. **WhatsApp bubble** — hides when `#contacto` section is visible; pre-fills message from form fields on submit
5. **Contact form** — no backend; builds a WhatsApp Web URL and redirects

### CSS conventions

- Design tokens are CSS custom properties on `:root` (`--bg`, `--accent`, `--accent-2`, etc.)
- Use `clamp()` for fluid typography/spacing
- Google Maps iframe is color-matched to the dark theme via CSS filters

## Pending placeholders in the code

These are hardcoded TODOs that need real values before launch:

- Phone numbers: `+56-9-XXXX-XXXX` / `+5491100000000`
- Business address: `"REEMPLAZAR CON DIRECCIÓN"`
- Map coordinates: generic Curicó/Santiago coordinates
- OG image: `https://www.hidrarb.cl/og-image.jpg`
- Slider images: placeholder CSS gradients (labeled `FOTO PRÓXIMAMENTE`)
