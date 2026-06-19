(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  function showSlide(next) {
    if (!slides.length) {
      return;
    }
    slides[current].classList.remove('is-active');
    if (dots[current]) {
      dots[current].classList.remove('is-active');
    }
    current = (next + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    if (dots[current]) {
      dots[current].classList.add('is-active');
    }
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (form) {
    var input = form.querySelector('input');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden-card', query && text.indexOf(query) === -1);
      });
    });
  });

  var searchList = document.querySelector('[data-search-list]');
  var searchSummary = document.querySelector('[data-search-summary]');
  var searchForm = document.querySelector('[data-search-form]');
  if (searchList && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (searchForm) {
      var field = searchForm.querySelector('input[name="q"]');
      if (field) {
        field.value = query;
      }
    }
    if (query) {
      var lowered = query.toLowerCase();
      var matches = window.MOVIE_INDEX.filter(function (item) {
        return item.text.toLowerCase().indexOf(lowered) !== -1;
      }).slice(0, 120);
      searchSummary.textContent = '以下为匹配“' + query + '”的影片。';
      searchList.innerHTML = matches.map(function (item) {
        return [
          '<article class="movie-card movie-card-compact">',
          '<a href="' + item.url + '">',
          '<figure class="poster-frame"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><figcaption>' + escapeHtml(item.year) + '</figcaption></figure>',
          '<div class="movie-card-body">',
          '<div class="movie-meta-line"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
          '<h3>' + escapeHtml(item.title) + '</h3>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }).join('');
      if (!matches.length) {
        searchList.innerHTML = '<p class="empty-state">暂未找到匹配影片，可尝试更换关键词。</p>';
      }
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
