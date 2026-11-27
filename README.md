# Kunal D Soni — Personal Site

Personal site of Kunal D Soni - a software engineer. Life first (travel, food, books), with work, case studies and impact one click away.

**Live site:** https://kunaldsoni.github.io/

## Structure

| File | Page |
| --- | --- |
| `index.html` | Home: time-of-day greeting, postcards from life, a short "by day" note, contact |
| `work.html` | Companies (Astratech/BOTIM, Dopay, Mintoak, Novo, Pedagogy) and products built at each |
| `case-botim.html`, `case-dopay.html`, `case-novo.html` | Case studies: problem → decisions → trade-offs → result |
| `impact.html` | Results and advisory |
| `life.html` | Travel, food, books |
| `startups.html`, `products.html` | Redirects to `work.html` (old links keep working) |
| `404.html` | Not-found page (GitHub Pages serves it automatically) |
| `styles.css`, `script.js` | Shared styles and scripts |
| `assets/` | Web-optimised images, logos and MP4 videos |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `og-image.png`, `favicon.svg` | SEO / sharing |

Plain HTML/CSS/JS, no build step.

## Run locally

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Checks

`.github/workflows/site-checks.yml` runs on every push: HTML validation (`html-validate`),
an offline link/asset check (`lychee`), and a guard that fails if key sections (the
postcards, the time-of-day script, canonical/og tags, sitemap) disappear. Run the validator locally with:

```bash
npx html-validate "*.html"
```

## Time-of-day colours

A tiny script in each page's `<head>` sets `<html data-time="...">` from the visitor's local clock,
and `styles.css` swaps colour tokens per value:

| Time | `data-time` | Look |
| --- | --- | --- |
| 05:00-10:59 | `morning` | light |
| 11:00-15:59 | `noon` | soft orange |
| 16:00-19:59 | `evening` | warm yellow |
| 20:00-04:59 | `night` | dark |

The chip in the nav cycles through the modes for the current tab (then back to "auto").

## Changing the site URL

The repo is named `KunalDSoni.github.io`, so GitHub Pages serves it at the root:
https://kunaldsoni.github.io/. All canonical / Open Graph / sitemap URLs use that address.
If you add a custom domain, replace `https://kunaldsoni.github.io/` everywhere and add a `CNAME` file.
