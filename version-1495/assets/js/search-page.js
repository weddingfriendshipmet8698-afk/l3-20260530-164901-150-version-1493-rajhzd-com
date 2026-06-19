(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    var meta = [movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(' · ');

    return [
      '<article class="movie-card" data-search-card data-title="' + escapeHtml(movie.title) + '" data-meta="' + escapeHtml(meta) + '">',
      '  <a href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster-frame">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-gradient"></span>',
      '      <span class="badge">' + escapeHtml(movie.year) + '</span>',
      '      <span class="play-chip">▶</span>',
      '    </div>',
      '    <h3 class="movie-title">' + escapeHtml(movie.title) + '</h3>',
      '  </a>',
      '  <div class="movie-meta">' + escapeHtml(meta) + '</div>',
      '  <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
      '</article>'
    ].join('\n');
  }

  function runSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.querySelector('[data-search-page-input]');
    var resultInfo = document.querySelector('[data-search-result-info]');
    var resultGrid = document.querySelector('[data-search-result-grid]');
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (!resultGrid) {
      return;
    }

    if (input) {
      input.value = query;
    }

    function render(value) {
      var keyword = normalize(value);
      var words = keyword.split(/\s+/).filter(Boolean);
      var results = data.filter(function (movie) {
        if (!words.length) {
          return true;
        }

        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));

        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });

      resultGrid.innerHTML = results.slice(0, 240).map(card).join('\n');

      if (resultInfo) {
        resultInfo.textContent = '找到 ' + results.length + ' 条相关影片，当前显示前 ' + Math.min(results.length, 240) + ' 条。';
      }
    }

    render(query);

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSearch);
  } else {
    runSearch();
  }
})();
