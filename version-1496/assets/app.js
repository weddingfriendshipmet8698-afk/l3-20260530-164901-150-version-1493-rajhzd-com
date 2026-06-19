(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('.hero');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dots button'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });

    if (hero) {
      hero.style.setProperty('--hero-bg', 'url("' + slides[current].getAttribute('data-bg') + '")');
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length) {
    showSlide(0);
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

  filterInputs.forEach(function (input) {
    input.addEventListener('input', filterCards);
    input.addEventListener('change', filterCards);
  });

  function filterCards() {
    var keywordInput = document.querySelector('[data-card-filter="keyword"]');
    var yearSelect = document.querySelector('[data-card-filter="year"]');
    var regionSelect = document.querySelector('[data-card-filter="region"]');
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
      var ok = true;

      if (keyword && text.indexOf(keyword) === -1) {
        ok = false;
      }

      if (year && card.getAttribute('data-year') !== year) {
        ok = false;
      }

      if (region && card.getAttribute('data-region') !== region) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    var empty = document.querySelector('.empty-state');
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  var globalInput = document.getElementById('globalSearchInput');
  var globalButton = document.getElementById('globalSearchButton');
  var globalResults = document.getElementById('globalSearchResults');

  function runGlobalSearch() {
    if (!globalInput || !globalResults || typeof SEARCH_INDEX === 'undefined') {
      return;
    }

    var keyword = globalInput.value.trim().toLowerCase();
    globalResults.innerHTML = '';

    if (!keyword) {
      return;
    }

    var results = SEARCH_INDEX.filter(function (item) {
      return item.q.indexOf(keyword) !== -1;
    }).slice(0, 18);

    results.forEach(function (item) {
      var link = document.createElement('a');
      var img = document.createElement('img');
      var span = document.createElement('span');
      var strong = document.createElement('strong');
      var em = document.createElement('em');

      link.href = item.url;
      img.src = item.cover;
      img.alt = item.title;
      strong.textContent = item.title;
      em.textContent = item.year + ' · ' + item.region;
      span.appendChild(strong);
      span.appendChild(document.createElement('br'));
      span.appendChild(em);
      link.appendChild(img);
      link.appendChild(span);
      globalResults.appendChild(link);
    });
  }

  if (globalInput) {
    globalInput.addEventListener('input', runGlobalSearch);
  }

  if (globalButton) {
    globalButton.addEventListener('click', runGlobalSearch);
  }
})();
