(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initCatalogs() {
    var catalogs = Array.prototype.slice.call(document.querySelectorAll('[data-catalog]'));
    catalogs.forEach(function (catalog) {
      var grid = catalog.querySelector('[data-grid]');
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
      var search = catalog.querySelector('[data-search-input]');
      var sort = catalog.querySelector('[data-sort-select]');
      var selects = Array.prototype.slice.call(catalog.querySelectorAll('[data-filter-key]'));
      var params = new URLSearchParams(window.location.search);

      if (search && params.get('search')) {
        search.value = params.get('search');
      }
      if (sort && params.get('sort')) {
        sort.value = params.get('sort');
      }

      function cardText(card) {
        return [
          card.dataset.title,
          card.dataset.category,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' ');
      }

      function apply() {
        var query = normalize(search ? search.value : '');
        var activeFilters = selects.map(function (select) {
          return {
            key: select.dataset.filterKey,
            value: normalize(select.value)
          };
        }).filter(function (item) {
          return item.value !== '';
        });

        cards.forEach(function (card) {
          var text = normalize(cardText(card));
          var matchedSearch = !query || text.indexOf(query) !== -1;
          var matchedFilters = activeFilters.every(function (filter) {
            return normalize(card.dataset[filter.key]).indexOf(filter.value) !== -1;
          });
          card.hidden = !(matchedSearch && matchedFilters);
        });

        var mode = sort ? sort.value : 'hot';
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'year') {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (mode === 'title') {
            return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
          }
          return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      if (sort) {
        sort.addEventListener('change', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  function initHeroSearch() {
    var form = document.querySelector('[data-hero-search]');
    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="search"]');
      var value = input ? input.value.trim() : '';
      var target = './all.html' + (value ? '?search=' + encodeURIComponent(value) : '');
      window.location.href = target;
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCatalogs();
    initHeroSearch();
  });
})();
