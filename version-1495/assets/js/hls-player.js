import { H as Hls } from './video-vendor-dru42stk.js';

function setState(message) {
  var state = document.querySelector('[data-player-state]');

  if (state) {
    state.textContent = message;
  }
}

function initHlsPlayer() {
  var video = document.querySelector('[data-hls-player]');
  var playButton = document.querySelector('[data-play-button]');
  var shell = document.querySelector('[data-video-shell]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-hls-src');
  var hls = null;
  var sourceReady = false;

  function loadSource() {
    if (sourceReady || !source) {
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setState('播放源已加载，正在准备播放。');
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setState('播放源加载遇到问题，请刷新页面后重试。');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setState('播放源已加载，正在准备播放。');
    } else {
      setState('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
    }

    sourceReady = true;
  }

  function playVideo() {
    loadSource();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setState('浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    }
  }

  function toggleVideo() {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  }

  if (playButton) {
    playButton.addEventListener('click', toggleVideo);
  }

  video.addEventListener('click', toggleVideo);
  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }

    setState('正在播放。');
  });
  video.addEventListener('pause', function () {
    if (shell) {
      shell.classList.remove('is-playing');
    }

    setState('已暂停，点击画面或播放按钮继续。');
  });
  video.addEventListener('waiting', function () {
    setState('正在缓冲，请稍候。');
  });
  video.addEventListener('error', function () {
    setState('播放失败，请刷新页面或稍后重试。');
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHlsPlayer);
} else {
  initHlsPlayer();
}
