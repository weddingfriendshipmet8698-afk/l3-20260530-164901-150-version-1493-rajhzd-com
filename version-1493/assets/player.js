(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('.movie-player');
    var button = shell.querySelector('.player-cover');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-src');
    var loaded = false;
    var hls = null;

    function loadAndPlay() {
      if (!source) {
        return;
      }
      button.classList.add('is-hidden');
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    button.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        loadAndPlay();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.player-shell').forEach(initPlayer);
})();
