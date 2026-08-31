# CineVerse

> **Discover your next favorite movie.**

CineVerse is a modern, fully responsive movie discovery website built with
**HTML5, CSS3 and vanilla JavaScript**, with no frameworks and no build tools.
It loads a local catalog of 50+ movies from a JSON file and lets
visitors browse trending films, search by title, filter by genre, sort,
and open rich detail pages with cast information and trailer links.

PHP is used *only* for the newsletter and contact forms; the entire movie
experience works without any server at all.

## Features

- Cinematic dark theme with a violet accent and a glass navbar
- Hero banner featuring a highlighted movie (title, rating, year, genres, trailer)
- Trending Now: horizontal scrolling row of flagged movies
- Popular Movies: highest-rated picks generated dynamically
- Browse by Genre tiles linking straight into filtered results
- Recommended for You: rotates through the catalog every month
- **Live search**: case-insensitive, debounced, with clear button
- **Genre filtering**: combine search + genre + sorting freely
- Sorting: Highest Rated / Newest / Oldest / A-Z
- Movie details page via URL parameters (`movie-details.html?id=5`)
- Cast section with initials avatars
- Trailer buttons open YouTube in a new tab (`rel="noopener noreferrer"`)
- Responsive from **320px to 1440px+** (no horizontal scrolling)
- Semantic HTML, focus states, ARIA labels, `prefers-reduced-motion` support
- Subtle animations: card hover/zoom, fade-up entrances, scroll reveal
- Loading skeletons, empty states and friendly error states
- Newsletter + contact forms with PHP handlers and a JS-only fallback
- SEO meta tags and Open Graph previews on every page

## Technologies

| Layer | Used for |
|---|---|
| HTML5 | Page structure, semantic landmarks |
| CSS3 | Theming (CSS variables), grid/flexbox layouts, animations |
| JavaScript (ES6) | Data loading, rendering, search, filtering, sorting, UI behaviour |
| JSON | Local movie dataset (`data/movies.json`) |
| Images | Movie posters and backdrops in JPG format |
| SVG | Icons and remaining vector artwork |
| PHP | Newsletter & contact form handling only |
| Git/GitHub | Version control |

Bootstrap was intentionally **not** used; the custom stylesheet gives a
more original look and keeps the site lightweight.

## Project Structure

```
cineverse/
|
|-- index.html              # Home: hero, trending, popular, genres, recommended, newsletter
|-- movies.html             # Full catalog: live search + genre chips + sorting
|-- movie-details.html      # Detail page, driven by ?id= query parameter
|-- about.html              # About CineVerse
|-- contact.html            # Contact form (PHP-backed)
|-- subscribe.php           # Newsletter endpoint, stores data/subscribers.json
|-- send.php                # Contact endpoint, stores data/messages.json
|
|-- css/
|   `-- style.css           # Single organized stylesheet (18 labeled sections)
|
|-- js/
|   |-- app.js              # Navbar, mobile menu, scroll reveal, forms
|   |-- movies.js           # Data loading, card rendering, search/filter/sort
|   `-- details.js          # Reads ?id= and renders one movie's details
|
|-- data/
|   |-- movies.json         # The movie catalog (50+ movie records)
|   `-- movies.js           # Auto-generated mirror used when opened via file://
|
|-- tools/
|   `-- sync-movies.js      # Regenerates data/movies.js after you edit the JSON
|
|-- php/
|   `-- helpers.php         # Shared sanitize/validate/storage functions
|
|-- assets/
|-- posters/             # poster-1.jpg ... poster-52.jpg
|-- images/              # backdrop-1.jpg ... backdrop-52.jpg
|   `-- icons/              # favicon.svg
|
`-- README.md
```

## How to Run

### Option 1: Plain static site (recommended for browsing)

The movie browsing/search/filtering needs **no server**:

1. Open the folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey) if you don't have it.
3. Right-click `index.html` and choose **"Open with Live Server"**
   (or click "Go Live" in the status bar).
4. The site opens at something like `http://127.0.0.1:5500/index.html`.

Double-clicking `index.html` also works. When opened as a plain file the site
automatically loads its data from `data/movies.js` instead of using `fetch()`
(which browsers block on `file://` pages).

### Option 2: XAMPP (to use the PHP forms)

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

Without PHP, both forms automatically switch to a demo mode message;
the rest of the website is unaffected.

### Full PHP support

For working forms, host anywhere with PHP (XAMPP locally, or a PHP web host):
upload the project root and it runs as-is.

---

Built as the **Frontend Development Internship, Project Phase 1, Task 2**.
