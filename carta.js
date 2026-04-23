/**
 * carta.js
 * Handles 3D page flip interactions (desktop) and single-page mobile viewer.
 */

document.addEventListener('DOMContentLoaded', () => {

    const book         = document.getElementById('book');
    const container    = document.querySelector('.book-container');
    const leaves       = Array.from(document.querySelectorAll('.leaf'));
    const prevBtn      = document.getElementById('prevBtn');
    const nextBtn      = document.getElementById('nextBtn');
    const pageCounter  = document.getElementById('pageCounter');
    const preloader    = document.getElementById('preloader');
    const mobileViewer = document.getElementById('mobileViewer');

    // Preloader
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => preloader.classList.add('fade-out'), 600);
        });
    }

    /* ── SHARED STATE ─────────────────────────────────────────── */
    const isMobile = () => window.innerWidth <= 840;

    /* ══════════════════════════════════════════════════════════════
       MOBILE VIEWER
       Shows every face (front + back of each leaf) one at a time.
    ══════════════════════════════════════════════════════════════ */
    let mobilePages    = [];  // DOM cards inside mobileViewer
    let mobileIndex    = 0;   // current page index (0 = Cover)
    let mobileBuilt    = false;

    // Page label for the nav counter
    const mobileLabels = [
        'Cubierta',
        'Índice',
        'Pág. 1: Ensaladas',
        'Pág. 2: Algo más',
        'Pág. 3: Pescados I',
        'Pág. 4: Pescados II',
        'Pág. 5: Nuestras Carnes I',
        'Pág. 6: Nuestras Carnes II',
        'Pág. 7: Nos vamos de Caza',
        'Pág. 8: Menú Degustación',
        'Pág. 9: Postres',
        'Pág. 10: Vinos Tintos',
        'Pág. 11: Vinos Tintos II',
        'Pág. 12: Blancos y Bebidas',
        'Notas',
        'Contraportada'
    ];

    function buildMobileViewer() {
        if (mobileBuilt) return;
        mobileBuilt = true;

        // Collect faces in reading order: front then back of each leaf
        const allFaces = [];
        leaves.forEach(leaf => {
            allFaces.push(leaf.querySelector('.front'));
            allFaces.push(leaf.querySelector('.back'));
        });

        allFaces.forEach((face, i) => {
            const card = document.createElement('div');

            // Copy relevant class names from the original face for styling
            const extraClasses = Array.from(face.classList)
                .filter(c => !['face', 'front', 'back'].includes(c))
                .join(' ');

            card.className = `mobile-page ${extraClasses}`;
            card.innerHTML = face.innerHTML;
            mobileViewer.appendChild(card);
            mobilePages.push(card);
        });

        // Swipe and Tap support on the viewer
        let touchStartX = 0;
        let swipeTriggered = false;

        mobileViewer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            swipeTriggered = false;
        }, { passive: true });

        mobileViewer.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (diff < -50) {
                mobileNext();
                swipeTriggered = true;
            } else if (diff > 50) {
                mobilePrev();
                swipeTriggered = true;
            }
        }, { passive: true });

        // Tap to turn pages (left half = prev, right half = next)
        mobileViewer.addEventListener('click', e => {
            if (swipeTriggered) {
                // Prevent turning page again if a swipe was just executed
                swipeTriggered = false;
                return;
            }
            const x = e.clientX;
            const width = window.innerWidth;
            if (x > width * 0.5) mobileNext();
            else mobilePrev();
        });

        showMobilePage(0, 'forward');
    }

    function showMobilePage(index) {
        mobilePages.forEach((card, i) => {
            if (i === index) {
                // Active page: clear inline overrides and let .active center it
                card.style.transform = '';
                card.classList.add('active');
            } else {
                // Inactive pages: move them off to the left or right with a subtle distance
                card.classList.remove('active');
                card.style.transform = i < index 
                    ? 'translateX(-15px) scale(0.99)' 
                    : 'translateX(15px) scale(0.99)';
            }
        });

        mobileIndex = index;
        updateMobileNav();
    }

    function updateMobileNav() {
        const label = mobileLabels[mobileIndex] ?? `Pág. ${mobileIndex}`;
        pageCounter.textContent = label;
        prevBtn.disabled = mobileIndex === 0;
        nextBtn.disabled = mobileIndex === mobilePages.length - 1;
    }

    function mobileNext() {
        if (mobileIndex < mobilePages.length - 1) {
            showMobilePage(mobileIndex + 1);
        }
    }

    function mobilePrev() {
        if (mobileIndex > 0) {
            showMobilePage(mobileIndex - 1);
        }
    }

    /* ══════════════════════════════════════════════════════════════
       DESKTOP BOOK (3D flip — unchanged)
    ══════════════════════════════════════════════════════════════ */
    let currentLeaf  = 0;
    const totalLeaves = leaves.length;

    function updateZIndexes() {
        leaves.forEach((leaf, i) => {
            leaf.style.zIndex = i < currentLeaf ? i : totalLeaves - i;
        });
    }

    function updateDesktopNav() {
        prevBtn.disabled = currentLeaf === 0;
        nextBtn.disabled = currentLeaf === totalLeaves;

        if (currentLeaf === 0) {
            pageCounter.textContent = 'Cubierta';
        } else if (currentLeaf === 1) {
            pageCounter.textContent = 'Índice / Pág. 1';
        } else if (currentLeaf === totalLeaves) {
            pageCounter.textContent = 'Contraportada';
        } else {
            pageCounter.textContent = `Pág. ${currentLeaf * 2 - 2}-${currentLeaf * 2 - 1}`;
        }
    }

    function updateBookPosition() {
        book.style.setProperty('--offset-x', '0px');
    }

    function handleResize() {
        if (isMobile()) {
            buildMobileViewer();
            return;
        }
        const pageWidth  = 420;
        const pageHeight = 600;
        const scaleW = (container.clientWidth  - 60) / (pageWidth * 2);
        const scaleH = (container.clientHeight - 120) /  pageHeight;
        const scale  = Math.min(scaleW, scaleH, 1.0);
        container.style.setProperty('--scale', scale);
        updateBookPosition();
    }

    function desktopNext() {
        if (currentLeaf < totalLeaves) {
            leaves[currentLeaf].classList.add('flipped');
            setTimeout(updateZIndexes, 300);
            currentLeaf++;
            updateDesktopNav();
            handleResize();
        }
    }

    function desktopPrev() {
        if (currentLeaf > 0) {
            currentLeaf--;
            leaves[currentLeaf].classList.remove('flipped');
            setTimeout(updateZIndexes, 300);
            updateDesktopNav();
            handleResize();
        }
    }

    // Click-on-page flipping (desktop)
    leaves.forEach((leaf, idx) => {
        leaf.querySelector('.front').addEventListener('click', () => {
            if (!isMobile() && idx === currentLeaf) desktopNext();
        });
        leaf.querySelector('.back').addEventListener('click', () => {
            if (!isMobile() && idx === currentLeaf - 1) desktopPrev();
        });
    });

    // Desktop swipe
    let touchStartX = 0;
    book.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    book.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (diff < -50) desktopNext();
        if (diff >  50) desktopPrev();
    }, { passive: true });

    /* ── DIRECT JUMP & SHARED LISTENERS ──────────────────────── */
    function jumpToDesktopLeaf(targetIndex) {
        if (targetIndex === currentLeaf) return;
        
        leaves.forEach((leaf, idx) => {
            if (idx < targetIndex) {
                leaf.classList.add('flipped');
            } else {
                leaf.classList.remove('flipped');
            }
        });
        currentLeaf = targetIndex;
        // Instant z-index update for smooth big jumps
        updateZIndexes();
        updateDesktopNav();
        handleResize();
    }

    // Interactive Index Click
    document.addEventListener('click', e => {
        const idxItem = e.target.closest('.index-item');
        if (idxItem) {
            e.stopPropagation(); // prevent triggering flip on the face
            const mobileTarget = parseInt(idxItem.getAttribute('data-mobile'), 10);
            const desktopTarget = parseInt(idxItem.getAttribute('data-desktop'), 10);
            
            if (isMobile()) {
                showMobilePage(mobileTarget);
            } else {
                jumpToDesktopLeaf(desktopTarget);
            }
        }
    });

    nextBtn.addEventListener('click', () => isMobile() ? mobileNext() : desktopNext());
    prevBtn.addEventListener('click', () => isMobile() ? mobilePrev() : desktopPrev());

    // Keyboard
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') isMobile() ? mobileNext() : desktopNext();
        if (e.key === 'ArrowLeft')  isMobile() ? mobilePrev() : desktopPrev();
    });

    window.addEventListener('resize', handleResize);

    /* ── INIT ────────────────────────────────────────────────── */
    function init() {
        if (isMobile()) {
            buildMobileViewer();
        } else {
            updateZIndexes();
            updateDesktopNav();
            handleResize();
        }
    }

    init();
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
        requestAnimationFrame(function () {
            document.body.style.cursor = cursorVal;
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
