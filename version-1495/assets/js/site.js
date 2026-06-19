(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      showSlide(0);
      start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterTags = Array.prototype.slice.call(document.querySelectorAll('[data-filter-tag]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeTag = '';

    function applyFilter() {
      if (!cards.length) {
        return;
      }

      var query = normalize(filterInput && filterInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta') + ' ' + card.textContent);
        var tagMatch = !activeTag || haystack.indexOf(activeTag) !== -1;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var shouldShow = tagMatch && queryMatch;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    filterTags.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = normalize(button.getAttribute('data-filter-tag'));
        activeTag = activeTag === value ? '' : value;

        filterTags.forEach(function (item) {
          item.classList.toggle('is-active', normalize(item.getAttribute('data-filter-tag')) === activeTag && activeTag !== '');
        });

        applyFilter();
      });
    });

    applyFilter();
  });
})();
