# CineVerse

> **Discover your next favorite movie.**

CineVerse is a modern, fully responsive movie discovery website built with
**HTML5, CSS3 and vanilla JavaScript** — no frameworks, no build tools.
It loads a local catalog of 22 fictional movies from a JSON file and lets
visitors browse trending films, search by title, filter by genre, sort,
and open rich detail pages with cast information and trailer links.

PHP is used *only* for the newsletter and contact forms; the entire movie
experience works without any server at all.

> ⚠️ All movies, actors, ratings and posters in this project are
> **fictional demo content** created for an internship task.
> They do not represent real productions, people or facts.

---

## Features

- 🎬 Cinematic dark theme with a violet accent and glass navbar
- 🦸 Hero banner featuring a highlighted movie (title, rating, year, genres, trailer)
- 🔥 Trending Now — horizontal scrolling row of flagged movies
- ⭐ Popular Movies — highest-rated picks generated dynamically
- 🧭 Browse by Genre tiles linking straight into filtered results
- 💡 Recommended for You — rotates through the catalog every month
- 🔍 **Live search** — case-insensitive, debounced, with clear button
- 🏷️ **Genre filtering** — combine search + genre + sorting freely
- ↕️ Sorting: Highest Rated / Newest / Oldest / A-Z
- 📄 Movie details page via URL parameters (`movie-details.html?id=5`)
- 👥 Cast section with initials avatars
- ▶️ Trailer buttons open YouTube in a new tab (`rel="noopener noreferrer"`)
- 📱 Responsive from **320px to 1440px+** (no horizontal scrolling)
- ♿ Semantic HTML, focus states, ARIA labels, `prefers-reduced-motion` support
- 🎞️ Subtle animations: card hover/zoom, fade-up entrances, scroll reveal
- ⏳ Loading skeletons, empty states and friendly error states
- ✉️ Newsletter + contact forms with PHP handlers and a JS-only fallback
- 🚀 SEO meta tags and Open Graph previews on every page

## Technologies

| Layer | Used for |
|---|---|
| HTML5 | Page structure, semantic landmarks |
| CSS3 | Theming (CSS variables), grid/flexbox layouts, animations |
| JavaScript (ES6) | Data loading, rendering, search, filtering, sorting, UI behaviour |
| JSON | Local movie dataset (`data/movies.json`) |
| SVG | All poster/backdrop/icon artwork (original, tiny, crisp) |
| PHP | Newsletter & contact form handling only |
| Git/GitHub | Version control |

Bootstrap was intentionally **not** used — the custom stylesheet gives a
more original look and keeps the site lightweight.

## Project Structure

```
cineverse/
│
├── index.html              # Home: hero, trending, popular, genres, recommended, newsletter
├── movies.html             # Full catalog: live search + genre chips + sorting
├── movie-details.html      # Detail page, driven by ?id= query parameter
├── about.html              # About CineVerse
├── contact.html            # Contact form (PHP-backed)
├── subscribe.php           # Newsletter endpoint → data/subscribers.json
├── send.php                # Contact endpoint → data/messages.json
│
├── css/
│   └── style.css           # Single organized stylesheet (18 labeled sections)
│
├── js/
│   ├── app.js              # Navbar, mobile menu, scroll reveal, forms
│   ├── movies.js           # Data loading, card rendering, search/filter/sort
│   └── details.js          # Reads ?id= and renders one movie's details
│
├── data/
│   ├── movies.json         # The movie catalog (22 fictional records)
│   └── movies.js           # Auto-generated mirror used when opened via file://
│
├── tools/
│   └── sync-movies.js      # Regenerates data/movies.js after you edit the JSON
│
├── php/
│   └── helpers.php         # Shared sanitize/validate/storage functions
│
├── assets/
│   ├── posters/            # poster-1.svg … poster-22.svg (movie artwork)
│   ├── images/             # backdrop-1…8.svg shared by movies + og-image
│   └── icons/              # favicon.svg, logo.svg
│
└── README.md               # You are here
```

## How to Run

### Option 1 — Plain static site (recommended for browsing)

The movie browsing/search/filtering needs **no server**:

1. Open the folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey) if you don't have it.
3. Right-click `index.html` → **"Open with Live Server"**
   (or click "Go Live" in the status bar).
4. The site opens at something like `http://127.0.0.1:5500/index.html`.

Double-clicking `index.html` also works — when opened as a plain file the site
automatically loads its data from `data/movies.js` instead of using `fetch()`
(which browsers block on `file://` pages).

### Option 2 — XAMPP (to use the PHP forms)

1. Copy the whole `cineverse` folder into:
   ```
   C:\xampp\htdocs\cineverse
   ```
2. Start **Apache** from the XAMPP Control Panel.
3. Open in your browser:
   ```
   http://localhost/cineverse/
   ```
4. The newsletter and contact forms now POST to `subscribe.php` / `send.php`
   and store submissions in `data/*.json`.

Without PHP, both forms automatically switch to a demo mode message —
the rest of the website is unaffected.

## Customization

### Add or edit movies

Open `data/movies.json`. Each record looks like:

```json
{
  "id": 23,
  "title": "My New Film",
  "year": 2026,
  "rating": 8.1,
  "genre": ["Action", "Thriller"],
  "description": "One-sentence hook shown on cards.",
  "fullDescription": "Longer text shown on the details page.",
  "poster": "assets/posters/poster-23.svg",
  "backdrop": "assets/images/backdrop-2.svg",
  "cast": ["Actor One", "Actor Two", "Actor Three", "Actor Four"],
  "releaseDate": "2026-07-24",
  "trailer": "https://www.youtube.com/results?search_query=my+new+film",
  "trending": false,
  "featured": false
}
```

- `id` must be unique (it drives the details page link).
- `"featured": true` puts a movie in the big home banner (keep exactly one).
- `"trending": true` adds it to the Trending row.
- New genre names appear as filter chips **automatically**.
- After editing, run `node tools/sync-movies.js` once so the file://
  fallback copy (`data/movies.js`) stays in sync with the JSON.

### Change movie posters / backdrops

Replace the SVG file inside `assets/posters/` (or drop in a `.jpg` and update
the `poster` path in `movies.json`). Posters look best around **400×600**
(2:3 ratio); backdrops are wide **16:9**. Any image format works.

### Change genres

Just edit the `genre` arrays in `movies.json` — chips, tiles and counts all
update themselves. No JavaScript changes needed.

### Change colors / theme

Edit the CSS variables at the top of `css/style.css`:

```css
:root {
    --background: #0a0a10;
    --accent:     #8b5cf6;   /* the whole brand color */
    ...
}
```

### Rename the website

The name appears in two places per page: the `<title>` tag and the
navbar/footer brand markup (`CINE<em>VERSE</em>`). Search-and-replace
"CINEVERSE"/"CineVerse" across the HTML files, plus `og:` meta tags.

## Deployment

> Note: none of these steps have been performed yet — the project has not
> been pushed anywhere. Instructions below are for when you're ready.

### GitHub Pages (static features)

1. Create a new repository on GitHub (e.g. `cineverse`).
2. From the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CineVerse movie website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cineverse.git
   git push -u origin main
   ```
3. Repository → **Settings → Pages** → Source: `main` branch, `/ (root)` → Save.
4. Your site will appear at `https://<your-username>.github.io/cineverse/`.
   *(PHP forms won't run there — they'll fall back to demo mode.)*

### Netlify

Drag-and-drop the `cineverse` folder onto [app.netlify.com](https://app.netlify.com)
— done. Same PHP caveat applies.

### Vercel

Import the Git repository at [vercel.com/new](https://vercel.com/new) with no
framework preset. Same PHP caveat applies.

### Full PHP support

For working forms, host anywhere with PHP (XAMPP locally, or a PHP web host):
upload the project root and it runs as-is.

---

Built as **Frontend Development Internship — Phase 1, Task 2**.
