/* ============================================================
   CineVerse — movies.js
   Everything about movie DATA and CARDS:
   - Loading data/movies.json (with friendly error handling)
   - Building movie card HTML
   - Home page sections (hero, trending, popular, recommended)
   - Catalog page: live search + genre filter + sorting

   This file exposes a small set of global functions that
   details.js also reuses (loadMovies, escapeHTML, etc.)
   ============================================================ */

"use strict";

/* ------------------------------------------------------------
   SHARED HELPERS
   ------------------------------------------------------------ */

/**
 * Escape user/data text before inserting it into HTML.
 * Prevents broken markup if a title contains characters like "&".
 */
function escapeHTML(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

/** Format "2026-05-10" as "May 10, 2026". */
function formatReleaseDate(isoDate) {
    const date = new Date(isoDate + "T00:00:00");
    if (Number.isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/** Small SVG play triangle used on trailer buttons. */
const PLAY_ICON =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
    '<path d="M8 5v14l11-7z"/></svg>';

/* ------------------------------------------------------------
   DATA LOADING
   One shared promise so several sections never fetch twice.
   Two ways to get the data:
   1. http(s): fetch data/movies.json (Live Server, XAMPP, hosting)
   2. file:// : browsers block fetch() on local files, so we load
                data/movies.js (a mirror of the JSON) via a script tag
   ------------------------------------------------------------ */
let moviesPromise = null;

function loadMovies() {
    if (!moviesPromise) {
        moviesPromise = loadMovieData().catch((error) => {
            console.error("CineVerse: could not load movie data —", error);
            moviesPromise = null; // allow a retry next time
            throw error;
        });
    }
    return moviesPromise;
}

function loadMovieData() {
    // Normal case: the page is served by a web server.
    if (location.protocol !== "file:") {
        return fetch("data/movies.json").then((response) => {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        });
    }

    // Opened by double-clicking index.html: script tags are allowed,
    // so pull the pre-generated copy from data/movies.js instead.
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "data/movies.js";
        script.onload = () => {
            if (Array.isArray(window.CINEVERSE_MOVIES) && window.CINEVERSE_MOVIES.length > 0) {
                resolve(window.CINEVERSE_MOVIES);
            } else {
                reject(new Error("data/movies.js loaded but contained no movies. Run: node tools/sync-movies.js"));
            }
        };
        script.onerror = () =>
            reject(new Error("Could not load data/movies.js. Run: node tools/sync-movies.js"));
        document.head.appendChild(script);
    });
}

/* ------------------------------------------------------------
   CARD RENDERING
   ------------------------------------------------------------ */

/**
 * Build ONE movie card as an HTML string.
 * Contains: poster, rating badge, title, rating + year,
 * genres, short description and a View Details button.
 */
function buildMovieCard(movie, index = 0) {
    const genres = movie.genre.map(escapeHTML).join(" • ");
    // Stagger the entrance animation slightly per card
    const delayStyle = `style="animation-delay:${Math.min(index, 11) * 45}ms"`;

    return `
    <article class="movie-card" ${delayStyle}>
      <div class="card-poster">
        <img src="${escapeHTML(movie.poster)}" alt="${escapeHTML(movie.title)} poster" loading="lazy">
        <span class="poster-rating" title="Rating out of 10"><span aria-hidden="true">&#9733;</span> ${movie.rating.toFixed(1)}</span>
        <div class="poster-overlay">
          <a class="btn-icon" href="${escapeHTML(movie.trailer)}"
             target="_blank" rel="noopener noreferrer"
             aria-label="Watch the trailer of ${escapeHTML(movie.title)} on YouTube">${PLAY_ICON}</a>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="movie-details.html?id=${movie.id}">${escapeHTML(movie.title)}</a></h3>
        <p class="card-meta">
          <span class="rating"><span aria-hidden="true">&#9733;</span> ${movie.rating.toFixed(1)}</span>
          <span aria-hidden="true">&bull;</span>
          <span>${movie.year}</span>
        </p>
        <p class="card-genres">${genres}</p>
        <p class="card-desc">${escapeHTML(movie.description)}</p>
        <a class="btn btn-sm" href="movie-details.html?id=${movie.id}">View Details</a>
      </div>
    </article>`;
}

/** Insert an array of movies into a container as cards. */
function renderMovieCards(container, movies) {
    container.innerHTML = movies.map((m, i) => buildMovieCard(m, i)).join("");
}

/* ------------------------------------------------------------
   SELECTION HELPERS (used by the home page)
   ------------------------------------------------------------ */

/** Movies flagged as trending in movies.json. */
function getTrendingMovies(movies) {
    return movies.filter((m) => m.trending === true);
}

/** Top-rated movies NOT in the trending list (so sections differ). */
function getPopularMovies(movies, count) {
    return [...movies]
        .filter((m) => m.trending !== true)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, count);
}

/**
 * Recommended rotates through the catalogue month by month,
 * so regular visitors see fresh suggestions without a backend.
 */
function getRecommendedMovies(movies, count) {
    const offset = new Date().getMonth();
    const rotated = [...movies.slice(offset), ...movies.slice(0, offset)];
    return rotated.filter((m) => m.rating >= 7.5).slice(0, count);
}

/* ------------------------------------------------------------
   HOME PAGE
   ------------------------------------------------------------ */
async function initHomePage() {
    const heroSection = document.getElementById("hero");
    if (!heroSection) return; // not on the home page

    try {
        const movies = await loadMovies();

        renderHero(getFeaturedMovie(movies));
        renderListInto("#trending-row", getTrendingMovies(movies));
        renderListInto("#popular-grid", getPopularMovies(movies, 6));
        renderRecommended("#recommended-grid", movies, 4);
        renderGenreTiles("#genre-tiles", movies);
    } catch (error) {
        // Data failed to load — tell visitors politely, log details for devs.
        showHomeError();
    }
}

/** The one movie picked for the big banner ("featured": true). */
function getFeaturedMovie(movies) {
    return movies.find((m) => m.featured === true) || movies[0];
}

function renderHero(movie) {
    const img = document.getElementById("hero-image");
    const title = document.getElementById("hero-title");
    const rating = document.getElementById("hero-rating");
    const year = document.getElementById("hero-year");
    const genres = document.getElementById("hero-genres");
    const desc = document.getElementById("hero-desc");
    const actions = document.getElementById("hero-actions");

    img.src = movie.backdrop;
    img.alt = `${movie.title} backdrop`;
    title.textContent = movie.title;
    rating.textContent = movie.rating.toFixed(1);
    year.textContent = movie.year;
    genres.textContent = movie.genre.join(" • ");
    desc.textContent = movie.description;
    actions.innerHTML = `
      <a class="btn" href="${escapeHTML(movie.trailer)}" target="_blank" rel="noopener noreferrer">${PLAY_ICON} Watch Trailer</a>
      <a class="btn btn-outline" href="movie-details.html?id=${movie.id}">View Details</a>`;
}

/**
 * Fill any grid/row container that holds movie cards.
 * Each section keeps its own loading skeleton element marked
 * with [data-skeleton]; it is removed once real cards exist.
 */
function renderListInto(selector, movies) {
    const container = document.querySelector(selector);
    if (!container) return;

    renderMovieCards(container, movies);

    const skeleton = container.closest("section")?.querySelector("[data-skeleton]");
    if (skeleton) skeleton.remove();
}

function renderRecommended(selector, movies, count) {
    renderListInto(selector, getRecommendedMovies(movies, count));
}

/** Genre tiles on the home page link into the filtered catalog. */
function renderGenreTiles(selector, movies) {
    const container = document.querySelector(selector);
    if (!container) return;

    // Icon per genre — plain emoji keeps it dependency-free.
    const icons = {
        Action: "&#127520;", Comedy: "&#128514;", Horror: "&#129504;",
        "Sci-Fi": "&#128640;", Drama: "&#127917;", Romance: "&#10084;",
        Thriller: "&#128374;", Adventure: "&#9978;", Animation: "&#127912;",
        Fantasy: "&#129412;",
    };

    // Count how many movies each genre has (for the tile subtitle)
    const counts = {};
    movies.forEach((m) => m.genre.forEach((g) => (counts[g] = (counts[g] || 0) + 1)));

    container.innerHTML = Object.keys(counts)
        .map(
            (genre) => `
      <a class="genre-tile" href="movies.html?genre=${encodeURIComponent(genre)}">
        <span class="genre-icon" aria-hidden="true">${icons[genre] || "&#127916;"}</span>
        <h3>${escapeHTML(genre)}</h3>
        <span>${counts[genre]} movie${counts[genre] > 1 ? "s" : ""}</span>
      </a>`
        )
        .join("");
}

function showHomeError() {
    // Friendly message inside each affected section
    document.querySelectorAll(".home-error").forEach((el) => {
        el.classList.add("visible");
    });
    // Remove loading placeholders and hide empty sections
    // so the page never looks half-broken to visitors
    document.querySelectorAll("[data-skeleton]").forEach((el) => el.remove());
    document.querySelectorAll("[data-movie-section]").forEach((el) => {
        el.hidden = true;
    });
}

/* ------------------------------------------------------------
   CATALOG PAGE (movies.html) — search + genre + sort combined
   ------------------------------------------------------------ */

// Current filter state. All three controls combine together.
const catalogState = {
    query: "",
    genre: "All",
    sort: "rating",
};

async function initCatalogPage() {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return; // not on the catalog page

    const searchInput = document.getElementById("catalog-search");
    const clearButton = document.getElementById("catalog-search-clear");
    const chipRow = document.getElementById("genre-chips");
    const sortSelect = document.getElementById("catalog-sort");
    const countEl = document.getElementById("results-count");
    const emptyState = document.getElementById("empty-state");
    const errorState = document.getElementById("error-state");
    const skeleton = document.getElementById("catalog-skeleton");

    let allMovies = [];

    /* --- Load the dataset first --- */
    try {
        allMovies = await loadMovies();
        skeleton.remove(); // hide "Loading movies..." placeholders
    } catch (error) {
        skeleton.remove();
        errorState.classList.add("visible"); // "Unable to load movies."
        document.querySelector(".filter-bar").hidden = true;
        return;
    }

    buildGenreChips(chipRow, allMovies);

    /* --- Restore filters from the URL (?search=&genre= links) --- */
    const params = new URLSearchParams(location.search);
    if (params.get("search")) {
        catalogState.query = params.get("search");
        searchInput.value = catalogState.query;
        clearButton.classList.add("visible");
    }
    if (params.get("genre")) catalogState.genre = params.get("genre");

    /* --- Wire up the three controls --- */
    searchInput.addEventListener("input", () => {
        catalogState.query = searchInput.value.trim();
        clearButton.classList.toggle("visible", catalogState.query !== "");
        debouncedApply();
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        catalogState.query = "";
        clearButton.classList.remove("visible");
        applyFilters();
        searchInput.focus();
    });

    chipRow.addEventListener("click", (event) => {
        const chip = event.target.closest(".chip");
        if (!chip) return;
        catalogState.genre = chip.dataset.genre;
        // Move the active highlight to the clicked chip
        chipRow.querySelectorAll(".chip").forEach((c) =>
            c.classList.toggle("active", c === chip)
        );
        applyFilters();
    });

    sortSelect.addEventListener("change", () => {
        catalogState.sort = sortSelect.value;
        applyFilters();
    });

    document.getElementById("clear-filters-btn").addEventListener("click", resetFilters);

    /* Debounce typing so we do not rebuild the grid on every letter */
    let debounceTimer;
    function debouncedApply() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 180);
    }

    function applyFilters() {
        let results = filterBySearch(allMovies, catalogState.query);
        results = filterByGenre(results, catalogState.genre);
        results = sortMovies(results, catalogState.sort);

        renderMovieCards(grid, results);
        countEl.innerHTML = `<strong>${results.length}</strong> movie${results.length === 1 ? "" : "s"} found`;

        emptyState.classList.toggle("visible", results.length === 0);
        updateUrlParams();
    }

    /** Push the current filters into the address bar (no reload). */
    function updateUrlParams() {
        const url = new URL(location.href);
        catalogState.query ? url.searchParams.set("search", catalogState.query)
                           : url.searchParams.delete("search");
        catalogState.genre !== "All" ? url.searchParams.set("genre", catalogState.genre)
                                     : url.searchParams.delete("genre");
        history.replaceState(null, "", url);
    }

    function resetFilters() {
        catalogState.query = "";
        catalogState.genre = "All";
        catalogState.sort = "rating";
        searchInput.value = "";
        clearButton.classList.remove("visible");
        sortSelect.value = "rating";
        chipRow.querySelectorAll(".chip").forEach((c) =>
            c.classList.toggle("active", c.dataset.genre === "All")
        );
        applyFilters();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    applyFilters(); // initial paint
}

/**
 * Case-insensitive search on the title (also matches cast names
 * as a small bonus). Empty query returns everything.
 */
function filterBySearch(movies, query) {
    if (!query) return movies;
    const q = query.toLowerCase();
    return movies.filter(
        (m) =>
            m.title.toLowerCase().includes(q) ||
            m.cast.some((name) => name.toLowerCase().includes(q))
    );
}

/** Keep only movies whose genre list contains the chosen genre. */
function filterByGenre(movies, genre) {
    if (genre === "All") return movies;
    return movies.filter((m) => m.genre.includes(genre));
}

/** Sort a copy of the list so the original order stays untouched. */
function sortMovies(movies, mode) {
    const sorted = [...movies];
    switch (mode) {
        case "newest":  sorted.sort((a, b) => b.year - a.year); break;
        case "oldest":  sorted.sort((a, b) => a.year - b.year); break;
        case "az":      sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "rating":
        default:        sorted.sort((a, b) => b.rating - a.rating); break;
    }
    return sorted;
}

/** Build the genre chip buttons (All + every genre found in data). */
function buildGenreChips(chipRow, movies) {
    // Required categories first, in a stable order...
    const ordered = ["Action", "Comedy", "Horror", "Sci-Fi", "Drama", "Romance"];
    const present = new Set(movies.flatMap((m) => m.genre));

    // ...then any extra genres the dataset happens to contain
    present.forEach((g) => {
        if (!ordered.includes(g)) ordered.push(g);
    });

    const chips = ["All", ...ordered.filter((g) => present.has(g))]
        .map(
            (genre) => `
      <button type="button"
              class="chip ${genre === catalogState.genre ? "active" : ""}"
              data-genre="${escapeHTML(genre)}">${escapeHTML(genre)}</button>`
        )
        .join("");

    chipRow.innerHTML = chips;
}

/* ------------------------------------------------------------
   BOOTSTRAP — decide which page we are on and start it.
   Each init function checks for its own root element, so this
   stays safe on every page.
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    initHomePage();
    initCatalogPage();
});
