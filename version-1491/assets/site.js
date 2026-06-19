(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var grid = qs('[data-search-grid]');
    if (!grid) {
      return;
    }
    var cards = qsa('[data-movie-card]', grid);
    var inputs = qsa('[data-filter-input]');
    var selects = qsa('[data-filter-select]');
    var empty = qs('[data-empty-result]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (q) {
      inputs.forEach(function (input) {
        input.value = q;
      });
    }

    function valueFor(key) {
      var select = qs('[data-filter-select="' + key + '"]');
      return normalize(select ? select.value : '');
    }

    function apply() {
      var keyword = normalize(inputs.map(function (input) {
        return input.value;
      }).filter(Boolean).join(' '));
      var region = valueFor('region');
      var type = valueFor('type');
      var year = valueFor('year');
      var visible = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var ok = true;

        if (keyword && search.indexOf(keyword) === -1) {
          ok = false;
        }
        if (region && cardRegion !== region) {
          ok = false;
        }
        if (type && cardType !== type) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  window.initVideoPlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
      return;
    }
    var shell = video.closest('.player-shell');
    var cover = shell ? qs('.player-cover', shell) : null;
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!loaded) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
