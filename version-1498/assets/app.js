document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let activeIndex = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const catalogPages = Array.from(document.querySelectorAll("[data-catalog-page]"));
    catalogPages.forEach(function (page) {
        const input = page.querySelector("[data-search-input]");
        const regionSelect = page.querySelector("[data-filter-region]");
        const yearSelect = page.querySelector("[data-filter-year]");
        const typeSelect = page.querySelector("[data-filter-type]");
        const cards = Array.from(page.querySelectorAll(".movie-card"));
        const params = new URLSearchParams(window.location.search);
        const queryValue = params.get("q");

        if (input && queryValue) {
            input.value = queryValue;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            const keyword = normalize(input ? input.value : "");
            const region = regionSelect ? regionSelect.value : "";
            const year = yearSelect ? yearSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                const text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                const sameRegion = !region || card.getAttribute("data-region") === region;
                const sameYear = !year || card.getAttribute("data-year") === year;
                const sameType = !type || card.getAttribute("data-type") === type;
                const hasKeyword = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden", !(sameRegion && sameYear && sameType && hasKeyword));
            });
        }

        [input, regionSelect, yearSelect, typeSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });
});
