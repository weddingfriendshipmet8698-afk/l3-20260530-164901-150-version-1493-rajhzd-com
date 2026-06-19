(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll('.search-input'));

    inputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || '',
                    card.dataset.year || '',
                    card.dataset.genre || '',
                    card.dataset.category || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();

                card.classList.toggle('is-filtered-out', value && text.indexOf(value) === -1);
            });
        });
    });
})();
