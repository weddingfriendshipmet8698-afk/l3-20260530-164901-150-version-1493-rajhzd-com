function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function mountPlayer(shell) {
  var source = shell.dataset.src;
  var video = shell.querySelector('video');
  var overlay = shell.querySelector('.player-overlay');
  var hls = null;
  var loaded = false;

  if (!source || !video) {
    return;
  }

  function markOverlay(hidden) {
    if (!overlay) {
      return;
    }
    overlay.classList.toggle('is-hidden', hidden);
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    var Hls = window.Hls;
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function play() {
    loadSource();
    markOverlay(true);
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        markOverlay(false);
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    markOverlay(true);
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      markOverlay(false);
    }
  });

  video.addEventListener('ended', function () {
    markOverlay(false);
  });

  shell.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

ready(function () {
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(mountPlayer);
});
