import { H as Hls } from './video-player-dru42stk.js';

function setupPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var cover = wrapper.querySelector('.player-cover');
    var message = wrapper.querySelector('.player-message');
    var source = wrapper.dataset.src;
    var started = false;
    var hls = null;

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function attachSource() {
        if (!video || !source) {
            setMessage('视频地址不可用');
            return false;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage('视频加载失败，请稍后重试');
                }
            });
            return true;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return true;
        }

        setMessage('当前浏览器不支持此视频格式');
        return false;
    }

    function play() {
        if (!started) {
            started = attachSource();
        }

        if (!started) {
            return;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                play();
            } else {
                video.pause();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

Array.prototype.slice.call(document.querySelectorAll('.js-video-player')).forEach(setupPlayer);
