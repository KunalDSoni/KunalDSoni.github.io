# Kunal D Soni — Personal Site

Portfolio of Kunal D Soni, Senior Fintech Product Manager: work history, case studies, impact, CV and life.

**Live site:** https://kunaldsoni.github.io/Fintech/

## Structure

| File | Page |
| --- | --- |
| `index.html` | Home: intro, headline numbers, work timeline, case-study cards, contact |
| `work.html` | Companies (Astratech/BOTIM, Dopay, Mintoak, Novo, Pedagogy) and products built at each |
| `case-botim.html`, `case-dopay.html`, `case-novo.html` | Case studies: problem → decisions → trade-offs → result |
| `impact.html` | Results and advisory |
| `cv.html`, `Kunal-D-Soni-CV.pdf` | CV (web + PDF) |
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
an offline link/asset check (`lychee`), and a guard that fails if key sections (the work
timeline, canonical/og tags, sitemap, CV) disappear. Run the validator locally with:

```bash
npx html-validate "*.html"
```

## Regenerating the CV PDF

Open `cv.html` in Chrome → Print → Save as PDF (A4, no headers/footers), save over `Kunal-D-Soni-CV.pdf`.

## Changing the site URL

All canonical / Open Graph / sitemap URLs use `https://kunaldsoni.github.io/Fintech/`. If the repo is
renamed to `KunalDSoni.github.io` (or a custom domain is added), replace that string everywhere and
update the `/Fintech/` paths in `404.html`.
