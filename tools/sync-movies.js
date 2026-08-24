/* ============================================================
   CineVerse — tools/sync-movies.js  (developer helper only)

   The website keeps TWO copies of the movie dataset:
   - data/movies.json  → used by fetch() when served over http(s)
   - data/movies.js    → used as a fallback when the site is opened
                         by double-clicking (file://), because browsers
                         block fetch() on file:// pages.

   Run this AFTER editing data/movies.json so both stay identical:

       node tools/sync-movies.js
   ============================================================ */

"use strict";

const fs = require("fs");
const path = require("path");

const jsonPath = path.join(__dirname, "..", "data", "movies.json");
const jsPath = path.join(__dirname, "..", "data", "movies.js");

// 1. Read and validate the canonical dataset
let movies;
try {
    movies = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} catch (error) {
    console.error("✗ Could not parse data/movies.json:", error.message);
    process.exit(1);
}

if (!Array.isArray(movies) || movies.length === 0) {
    console.error("✗ data/movies.json must contain a non-empty array of movies.");
    process.exit(1);
}

// 2. Write the mirror as a tiny script that sets a global variable
const banner =
    "/* ============================================================\n" +
    "   CineVerse — data/movies.js\n" +
    "   AUTO-GENERATED from movies.json by tools/sync-movies.js.\n" +
    "   Do not edit by hand — edit data/movies.json and re-run:\n" +
    "       node tools/sync-movies.js\n" +
    "   ============================================================ */\n\n";

const output = banner + "window.CINEVERSE_MOVIES = " + JSON.stringify(movies, null, 4) + ";\n";

fs.writeFileSync(jsPath, output, "utf8");

// 3. Friendly confirmation with a quick sanity summary
const featured = movies.filter((m) => m.featured).length;
const trending = movies.filter((m) => m.trending).length;
console.log(`✓ Wrote ${path.relative(process.cwd(), jsPath)} (${movies.length} movies, featured=${featured}, trending=${trending})`);
