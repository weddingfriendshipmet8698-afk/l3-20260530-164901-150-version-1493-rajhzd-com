(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var panel = document.querySelector(".hero-panel");
  var current = 0;

  function activateHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });

    if (panel) {
      var slide = slides[current];
      var img = panel.querySelector("img");
      var title = panel.querySelector("h2");
      var text = panel.querySelector("p");
      var link = panel.querySelector("a");
      var tags = panel.querySelector(".hero-tags");

      if (img) {
        img.src = slide.getAttribute("data-image") || img.src;
        img.alt = slide.getAttribute("data-title") || img.alt;
      }

      if (title) {
        title.textContent = slide.getAttribute("data-title") || title.textContent;
      }

      if (text) {
        text.textContent = slide.getAttribute("data-desc") || text.textContent;
      }

      if (link) {
        link.href = slide.getAttribute("data-link") || link.href;
      }

      if (tags) {
        var raw = slide.getAttribute("data-tags") || "";
        tags.innerHTML = raw.split("|").filter(Boolean).slice(0, 4).map(function (item) {
          return "<span>" + item + "</span>";
        }).join("");
      }
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      activateHero(index);
    });
  });

  if (slides.length) {
    activateHero(0);
    window.setInterval(function () {
      activateHero(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var searchInput = document.querySelector("[data-search]");
  var yearSelect = document.querySelector("[data-year-filter]");
  var regionSelect = document.querySelector("[data-region-filter]");
  var genreSelect = document.querySelector("[data-genre-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var emptyState = document.querySelector("[data-empty]");

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput && searchInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var genre = normalize(genreSelect && genreSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre")
      ].join(" "));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
      var matchRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
      var matchGenre = !genre || normalize(card.getAttribute("data-genre")).indexOf(genre) !== -1;
      var matched = matchQuery && matchYear && matchRegion && matchGenre;

      card.classList.toggle("hidden-card", !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("show", visible === 0);
    }
  }

  [searchInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      searchInput.value = q;
    }
  }

  applyFilters();
})();
