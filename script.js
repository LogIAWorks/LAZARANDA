document.addEventListener('DOMContentLoaded', () => {
    // Preloader logic
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('fade-out');
            }, 500); // Small delay for aesthetic purposes
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    animateElements.forEach(el => observer.observe(el));
    

    // Carousel Logic Implementation (Generic for multiple instances)
    function initCarousel(carouselId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;

        const carouselInner = carousel.querySelector('.carousel-inner');
        const carouselItems = carousel.querySelectorAll('.carousel-item');
        const prevBtn = carousel.querySelector('.carousel-control.prev');
        const nextBtn = carousel.querySelector('.carousel-control.next');
        const indicators = carousel.querySelectorAll('.indicator');
        
        if (!carouselInner || carouselItems.length === 0) return;

        let currentIndex = 0;
        const totalItems = carouselItems.length;

        function updateCarousel() {
            carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === currentIndex);
            });
            carouselItems.forEach((item, i) => {
                item.classList.toggle('active', i === currentIndex);
            });
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
        }

        if (nextBtn) nextBtn.addEventListener('click', showNext);
        if (prevBtn) prevBtn.addEventListener('click', showPrev);

        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.getAttribute('data-index'));
                if (!isNaN(index)) {
                    currentIndex = index;
                    updateCarousel();
                }
            });
        });

        // Swipe support
        let touchStartX = 0;
        carouselInner.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        carouselInner.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (diff < -50) showNext();
            if (diff > 50) showPrev();
        }, {passive: true});

        // Auto-play for dish-carousel only
        if (carouselId === 'dish-carousel') {
             let autoPlayInterval = setInterval(showNext, 5000);
             carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
             carousel.addEventListener('mouseleave', () => {
                 autoPlayInterval = setInterval(showNext, 5000);
             });
        }
    }

    initCarousel('dish-carousel');
    initCarousel('about-carousel');

    // ── Galería Platos Carousel (Infinite Auto-Scroll) ──
    const galeriaInner = document.getElementById('galeriaInner');
    const galeriaPrev  = document.getElementById('galeriaPrev');
    const galeriaNext  = document.getElementById('galeriaNext');

    if (galeriaInner) {
        if (galeriaPrev) galeriaPrev.remove();
        if (galeriaNext) galeriaNext.remove();

        // Duplicamos todos los items para tener suficientes elementos en pantallas grandes
        const originalItems = Array.from(galeriaInner.children);
        originalItems.forEach(item => {
            galeriaInner.appendChild(item.cloneNode(true));
        });
        originalItems.forEach(item => {
            galeriaInner.appendChild(item.cloneNode(true)); // Y otra vez
        });

        let scrollPos = 0;
        function scrollLoop() {
            scrollPos += 0.65; // Velocidad equilibrada, un punto intermedio perfecto
            galeriaInner.scrollLeft = scrollPos;

            // Cuando el primer elemento desaparece por completo por la izquierda,
            // lo quitamos y lo ponemos al final para crear el bucle infinito sin salto.
            const firstChild = galeriaInner.firstElementChild;
            if (firstChild && galeriaInner.scrollLeft >= firstChild.offsetWidth + 20) { // 20 es el gap
                galeriaInner.appendChild(firstChild);
                scrollPos -= (firstChild.offsetWidth + 20);
                galeriaInner.scrollLeft = scrollPos;
            }
            requestAnimationFrame(scrollLoop);
        }
        
        // Start after brief delay to layout render
        setTimeout(() => {
            scrollLoop();
        }, 500);
    }

    // ── Lazy-load YouTube video ──
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoContainer = document.getElementById('videoContainer');

    function loadVideo() {
        if (!videoThumbnail || !videoContainer) return;

        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/WuKrqrnjEpM?rel=0&modestbranding=1&color=white&autoplay=1';
        iframe.title = 'La Zaranda – Restaurante en Ciudad Real';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:22px;';

        // Fade out thumbnail, inject iframe
        videoThumbnail.style.transition = 'opacity 0.3s ease';
        videoThumbnail.style.opacity = '0';
        setTimeout(() => {
            videoContainer.innerHTML = '';
            videoContainer.appendChild(iframe);
        }, 300);
    }

    if (videoThumbnail) {
        videoThumbnail.addEventListener('click', loadVideo);
        // Keyboard accessibility
        videoThumbnail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadVideo(); }
        });
    }

});

/* ── Cursor Watchdog (Safari/macOS fix) ──────────────────────────
   Safari intermittently drops custom CSS cursors after extended use.
   This periodically re-applies the cursor value via JS and also
   re-applies when the tab regains visibility.
   ──────────────────────────────────────────────────────────────── */
(function () {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var cursorVal =
        "url('assets/images/cursor_corzo.svg') 12 10, " +
        "url('assets/images/cursor_corzo.png') 12 10, auto";

    function reapply() {
        document.body.style.cursor = 'auto';
        document.documentElement.style.cursor = 'auto';
        requestAnimationFrame(function () {
            document.body.style.cursor = cursorVal;
            document.documentElement.style.cursor = cursorVal;
        });
    }

    // Re-apply every 30 seconds
    setInterval(reapply, 30000);

    // Re-apply when tab becomes visible again
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) reapply();
    });

    // Re-apply after any window focus
    window.addEventListener('focus', reapply);
})();
