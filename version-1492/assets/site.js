import { H as Hls } from './video-vendor-dru42stk.js';

const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupNavigation() {
    const button = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    const root = document.querySelector('[data-hero]');

    if (!root) {
        return;
    }

    const slides = $$('[data-hero-slide]', root);
    const dots = $$('[data-hero-dot]', root);
    let active = 0;
    let timer = null;

    const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(active + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            show(i);
            start();
        });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
}

function setupCardSearch() {
    const inputs = $$('[data-card-search]');

    inputs.forEach((input) => {
        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            const cards = $$('.movie-card');

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre
                ].join(' ').toLowerCase();

                card.classList.toggle('is-hidden', query !== '' && !haystack.includes(query));
            });
        });
    });
}

function attachHls(video, source) {
    if (!source || video.dataset.hlsReady === 'true') {
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
    }

    video.dataset.hlsReady = 'true';
}

function setupPlayers() {
    const players = $$('.js-player');

    players.forEach((player) => {
        const source = player.dataset.src;
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        const beginPlayback = async () => {
            attachHls(video, source);
            button.classList.add('is-hidden');

            try {
                await video.play();
            } catch (error) {
                button.classList.remove('is-hidden');
                console.warn('Video playback was blocked until user interaction.', error);
            }
        };

        button.addEventListener('click', beginPlayback);
        video.addEventListener('play', () => button.classList.add('is-hidden'));
        video.addEventListener('pause', () => {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', () => button.classList.remove('is-hidden'));
    });
}

function setupSmoothPlayerLinks() {
    $$('a[href="#player"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const player = document.querySelector('#player');

            if (!player) {
                return;
            }

            event.preventDefault();
            player.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

setupNavigation();
setupHeroSlider();
setupCardSearch();
setupPlayers();
setupSmoothPlayerLinks();
