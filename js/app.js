/* ============================================================
   CineVerse - app.js
   General UI behaviour shared by every page:
   - Sticky navbar background when scrolling
   - Mobile hamburger menu
   - Highlighting the current page in the navigation
   - Scroll-reveal animations
   - Footer year
   - Newsletter / contact forms (PHP when available, JS fallback)
   ============================================================ */

"use strict";

/* Wait for the HTML to be fully parsed before touching the DOM */
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initMobileMenu();
    initActiveNavLink();
    initScrollReveal();
    initNavSearch();
    updateFooterYear();
    initNewsletterForm();
    initContactForm();
});

/* ------------------------------------------------------------
   NAVBAR QUICK SEARCH - the magnifier expands a small input.
   Submitting jumps to movies.html?search=... where the full
   live-filtering catalog takes over. Escape closes it.
   ------------------------------------------------------------ */
function initNavSearch() {
    const form = document.getElementById("nav-search");
    const toggle = document.getElementById("nav-search-toggle");
    const input = document.getElementById("nav-search-input");
    if (!form || !toggle || !input) return;

    toggle.addEventListener("click", () => {
        const isOpen = form.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen) {
            input.focus();
        } else {
            input.value = "";
        }
    });

    // Never navigate with an empty query - just close the field
    form.addEventListener("submit", (event) => {
        if (input.value.trim() === "") event.preventDefault();
    });

    // Escape closes the search field, like the mobile menu
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && form.classList.contains("open")) {
            form.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.focus();
        }
    });
}

/* ------------------------------------------------------------
   NAVBAR - add a blurred dark background once the user scrolls
   ------------------------------------------------------------ */
function initNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const onScroll = () => {
        // "scrolled" turns the transparent bar into frosted glass
        navbar.classList.toggle("scrolled", window.scrollY > 24);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once so a reloaded mid-page looks right
}

/* ------------------------------------------------------------
   MOBILE MENU - open/close the slide-down panel.
   Closes when: a link is chosen, Escape is pressed,
   or the viewport grows past the desktop breakpoint.
   ------------------------------------------------------------ */
function initMobileMenu() {
    const toggle = document.querySelector(".hamburger");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
        menu.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
        setOpen(!menu.classList.contains("open"));
    });

    // Close after tapping any link inside the panel
    menu.addEventListener("click", (event) => {
        if (event.target.closest("a")) setOpen(false);
    });

    // Close with the Escape key and send focus back to the button
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menu.classList.contains("open")) {
            setOpen(false);
            toggle.focus();
        }
    });

    // Reset state if the window is resized to desktop size
    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) setOpen(false);
    });
}

/* ------------------------------------------------------------
   ACTIVE LINK - mark the nav item that matches this page
   ------------------------------------------------------------ */
function initActiveNavLink() {
    const here = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((link) => {
        const target = link.getAttribute("href")?.split("#")[0];
        if (target && target !== "" && target === here) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

/* ------------------------------------------------------------
   SCROLL REVEAL - fade sections in as they enter the viewport.
   Uses IntersectionObserver; skipped entirely when the user
   prefers reduced motion.
   ------------------------------------------------------------ */
function initScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target); // animate only once
                }
            });
        },
        { threshold: 0.12 }
    );

    items.forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------
   FOOTER YEAR - keeps the copyright year current
   ------------------------------------------------------------ */
function updateFooterYear() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
}

/* ------------------------------------------------------------
   FORM HELPERS - shared by newsletter + contact forms.
   The site works two ways:
   1. Served by PHP (XAMPP/Live Server with PHP): forms POST to
      subscribe.php / send.php which save submissions to JSON.
   2. Opened as plain static files: fetch fails, so we fall back
      to a friendly demo message instead of an error.
   ------------------------------------------------------------ */
async function submitForm(url, payload, statusEl) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Bad response " + response.status);

        const result = await response.json();
        return result.ok === true;
    } catch (error) {
        // No PHP server available (or network hiccup) - demo fallback.
        console.info("Form endpoint unavailable, using demo mode.", error.message);
        statusEl.textContent =
            "Demo mode: your message was noted locally. Deploy with PHP hosting to store real submissions.";
        statusEl.className = "form-status success";
        return null;
    }
}

function setStatus(statusEl, message, ok) {
    statusEl.textContent = message;
    statusEl.className = "form-status " + (ok ? "success" : "error");
}

/* ------------------------------------------------------------
   NEWSLETTER FORM (footer band on the home page)
   ------------------------------------------------------------ */
function initNewsletterForm() {
    const form = document.getElementById("newsletter-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // stop the browser reloading the page

        const emailInput = form.querySelector("input[type='email']");
        const statusEl = document.getElementById("newsletter-status");
        const email = emailInput.value.trim();

        // Simple client-side validation before anything is sent
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setStatus(statusEl, "Please enter a valid email address.", false);
            return;
        }

        const saved = await submitForm("subscribe.php", { email }, statusEl);
        if (saved === true) {
            setStatus(statusEl, "You're on the list! Welcome to CineVerse.", true);
            form.reset();
        } else if (saved === false) {
            setStatus(statusEl, "Something went wrong. Please try again later.", false);
        }
    });
}

/* ------------------------------------------------------------
   CONTACT FORM (contact.html) - validates each field,
   highlights problems, then posts to send.php.
   ------------------------------------------------------------ */
function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const subject = form.elements.subject.value.trim();
        const message = form.elements.message.value.trim();
        const statusEl = document.getElementById("contact-status");

        // Validate fields one by one and flag the bad ones
        let valid = true;

        valid &= setFieldValidity(form.elements.name, name.length >= 2);
        valid &= setFieldValidity(form.elements.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        valid &= setFieldValidity(form.elements.subject, subject.length >= 3);
        valid &= setFieldValidity(form.elements.message, message.length >= 10);

        if (!valid) {
            setStatus(statusEl, "Please fix the highlighted fields.", false);
            return;
        }

        const saved = await submitForm(
            "send.php",
            { name, email, subject, message },
            statusEl
        );

        if (saved === true) {
            setStatus(statusEl, "Message sent! We'll get back to you soon.", true);
            form.reset();
        } else if (saved === false) {
            setStatus(statusEl, "Something went wrong. Please try again later.", false);
        }
    });
}

/* Toggle the red error styling under a single field */
function setFieldValidity(inputElement, isValid) {
    inputElement.closest(".form-field").classList.toggle("invalid", !isValid);
    return isValid;
}
