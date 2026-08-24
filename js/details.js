/* ============================================================
   CineVerse — details.js
   The movie details page (movie-details.html):
   - Reads the movie id from the URL: movie-details.html?id=5
   - Renders backdrop, poster, title, rating, dates, genres,
     full description, cast and trailer button
   - Shows a friendly "movie not found" state for bad ids

   It reuses loadMovies() and the helpers from movies.js.
   ============================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", initDetailsPage);

function initDetailsPage() {
    const loading = document.getElementById("details-loading");
    const content = document.getElementById("details-content");
    const notFound = document.getElementById("not-found");
    if (!loading) return; // not on the details page

    // 1. Which movie did the visitor ask for?
    const params = new URLSearchParams(location.search);
    const requestedId = Number(params.get("id"));

    if (!requestedId || Number.isNaN(requestedId)) {
        return showNotFound(loading, content, notFound);
    }

    // 2. Load the dataset and find that one movie
    loadMovies()
        .then((movies) => {
            const movie = movies.find((m) => m.id === requestedId);

            if (!movie) {
                showNotFound(loading, content, notFound);
                return;
            }

            renderMovieDetails(movie);
            loading.hidden = true;
            content.hidden = false;

            // Keep the browser tab title in sync with the movie
            document.title = `${movie.title} | CineVerse`;
        })
        .catch(() => {
            // Data could not be loaded at all (same message style)
            showNotFound(loading, content, notFound, true);
        });
}

/** Swap the page to the "we couldn't find it" panel. */
function showNotFound(loading, content, notFound, isError = false) {
    loading.hidden = true;
    content.hidden = true;
    notFound.hidden = false;

    if (isError) {
        notFound.querySelector("h1").textContent = "Unable to load this movie";
        notFound.querySelector("p").textContent =
            "Something went wrong while fetching the data. Please try again later.";
    }
}

/** Fill every part of the details layout with one movie's data. */
function renderMovieDetails(movie) {
    // Backdrop banner behind everything
    const backdrop = document.getElementById("detail-backdrop-img");
    backdrop.src = movie.backdrop;
    backdrop.alt = `${movie.title} scene artwork`;

    // Poster column
    const poster = document.getElementById("detail-poster-img");
    poster.src = movie.poster;
    poster.alt = `${movie.title} poster`;

    // Text information
    document.getElementById("detail-title").textContent = movie.title;

    document.getElementById("detail-rating").innerHTML =
        '<span aria-hidden="true">&#9733;</span> ' + movie.rating.toFixed(1);

    document.getElementById("detail-year").textContent = movie.year;
    document.getElementById("detail-release-date").textContent =
        formatReleaseDate(movie.releaseDate);

    const genreRow = document.getElementById("detail-genres");
    genreRow.innerHTML = movie.genre
        .map((g) => `<span class="genre-tag">${escapeHTML(g)}</span>`)
        .join("");

    document.getElementById("detail-description").textContent = movie.fullDescription;

    // Cast cards with initials avatars (no actor photos needed)
    const castGrid = document.getElementById("cast-grid");
    castGrid.innerHTML = movie.cast
        .map((name) => {
            const initials = getInitials(name);
            return `
        <div class="cast-card">
          <span class="cast-avatar" aria-hidden="true">${initials}</span>
          <span class="cast-name">${escapeHTML(name)}</span>
          <span class="cast-role">Cast member</span>
        </div>`;
        })
        .join("");

    // Action buttons: trailer opens in a NEW tab via target="_blank"
    document.getElementById("detail-trailer-btn").href = movie.trailer;
}

/** "Tom Hanks" -> "TH" for the avatar placeholder. */
function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
