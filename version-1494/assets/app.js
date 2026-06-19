(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function markMissingImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
        image.removeAttribute('src');
      });
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-target]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
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
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var filter = document.querySelector('[data-filter]');
    if (!filter) {
      return;
    }
    var input = filter.querySelector('[data-filter-keyword]');
    var type = filter.querySelector('[data-filter-type]');
    var year = filter.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        card.classList.toggle('is-hidden', !(matchQuery && matchType && matchYear));
      });
    }

    [input, type, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  }

  function createResultCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-frame" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.genre) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.text) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '</div>'
    ].join('');
    return article;
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

  function setupSearchPage() {
    var panel = document.querySelector('[data-search-page]');
    if (!panel || !window.SITE_ITEMS) {
      return;
    }
    var form = panel.querySelector('[data-search-form]');
    var input = panel.querySelector('[data-search-input]');
    var type = panel.querySelector('[data-search-type]');
    var result = document.querySelector('[data-search-results]');
    var note = document.querySelector('[data-search-note]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      var typeValue = type.value;
      var items = window.SITE_ITEMS.filter(function (item) {
        var matchQuery = !query || item.terms.indexOf(query) !== -1;
        var matchType = !typeValue || item.type === typeValue;
        return matchQuery && matchType;
      }).slice(0, 96);
      result.innerHTML = '';
      items.forEach(function (item) {
        result.appendChild(createResultCard(item));
      });
      if (note) {
        note.textContent = items.length ? '匹配影片：' + items.length : '没有找到匹配内容，可以更换关键词或类型。';
      }
      markMissingImages();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      render();
    });
    input.addEventListener('input', render);
    type.addEventListener('change', render);
    render();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play]');
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var hlsInstance = null;

      function attach() {
        return new Promise(function (resolve) {
          if (video.getAttribute('data-ready') === '1') {
            resolve();
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.setAttribute('data-ready', '1');
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal && hlsInstance) {
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                  hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                  hlsInstance.recoverMediaError();
                } else {
                  hlsInstance.destroy();
                }
              }
            });
            return;
          }
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.setAttribute('data-ready', '1');
            resolve();
            return;
          }
          video.src = stream;
          video.setAttribute('data-ready', '1');
          resolve();
        });
      }

      function play(event) {
        if (event) {
          event.preventDefault();
        }
        attach().then(function () {
          shell.classList.add('is-playing');
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              shell.classList.remove('is-playing');
            });
          }
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  ready(function () {
    markMissingImages();
    setupMobileMenu();
    setupCarousel();
    setupLocalFilter();
    setupSearchPage();
    setupPlayers();
  });
})();
