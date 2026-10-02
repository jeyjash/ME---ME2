/**
 * CONFIGURATION & STATE
 */
const CONFIG = {
    selectors: {
        announcement: '.announcement-bar',
        announcementClose: '[data-announcement-close]',
        header: '.site-header',
        menuToggle: '[data-menu-toggle]',
        navLinks: '.nav-link',
        hero: '.hero',
        heroImage: '.hero-image',
        heroIndicators: '.indicator-item',
        newsletterForm: '.newsletter-form',
        newsletterEmail: '#newsletter-email',
        revealElements: '[data-reveal]',
        anchorLinks: 'a[href^="#"]',
        productCards: '.product-card',
        categoryCards: '.category-card'
    },
    classes: {
        isScrolled: 'is-scrolled',
        isVisible: 'is-visible',
        isActive: 'is-active',
        menuOpen: 'menu-is-open',
        announcementHidden: 'announcement-is-hidden'
    },
    storage: {
        announcementDismissed: 'me-and-me-announcement-dismissed'
    },
    thresholds: {
        scroll: 50,
        reveal: 0.15
    }
};

const STATE = {
    isMenuOpen: false,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

/**
 * UTILITY HELPERS
 */
const query = (selector, context = document) => context.querySelector(selector);
const queryAll = (selector, context = document) => Array.from(context.querySelectorAll(selector));

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

/**
 * ANNOUNCEMENT BAR
 */
const initAnnouncement = () => {
    const bar = query(CONFIG.selectors.announcement);
    const closeBtn = query(CONFIG.selectors.announcementClose);

    if (!bar || !closeBtn) return;

    // Check persistence
    if (localStorage.getItem(CONFIG.storage.announcementDismissed) === 'true') {
        bar.style.display = 'none';
        document.body.classList.add(CONFIG.classes.announcementHidden);
        return;
    }

    closeBtn.addEventListener('click', () => {
        bar.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease';
        bar.style.transform = 'translateY(-100%)';
        bar.style.opacity = '0';
        
        setTimeout(() => {
            bar.style.display = 'none';
            document.body.classList.add(CONFIG.classes.announcementHidden);
            localStorage.setItem(CONFIG.storage.announcementDismissed, 'true');
        }, 400);
    });
};

/**
 * NAVIGATION & HEADER
 */
const initNavigation = () => {
    const header = query(CONFIG.selectors.header);
    const toggle = query(CONFIG.selectors.menuToggle);
    const links = queryAll(CONFIG.selectors.navLinks);

    if (!toggle) return;

    const toggleMenu = (forceState) => {
        STATE.isMenuOpen = typeof forceState === 'boolean' ? forceState : !STATE.isMenuOpen;
        
        document.body.classList.toggle(CONFIG.classes.menuOpen, STATE.isMenuOpen);
        toggle.setAttribute('aria-expanded', STATE.isMenuOpen);
        toggle.setAttribute('aria-label', STATE.isMenuOpen ? 'Close menu' : 'Open menu');

        // Prevent background interaction
        document.body.style.overflow = STATE.isMenuOpen ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => toggleMenu());

    // Close menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (STATE.isMenuOpen) toggleMenu(false);
        });
    });

    // Accessibility: Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && STATE.isMenuOpen) toggleMenu(false);
    });

    // Close on outside click (if menu is absolute/fixed overlay)
    document.addEventListener('click', (e) => {
        if (STATE.isMenuOpen && !header.contains(e.target)) {
            toggleMenu(false);
        }
    });
};

const initHeaderScroll = () => {
    const header = query(CONFIG.selectors.header);
    if (!header) return;

    let ticking = false;

    const updateHeader = () => {
        const scrollY = window.scrollY;
        if (scrollY > CONFIG.thresholds.scroll) {
            header.classList.add(CONFIG.classes.isScrolled);
        } else {
            header.classList.remove(CONFIG.classes.isScrolled);
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
};

/**
 * HERO INTERACTIONS
 */
const initHero = () => {
    const hero = query(CONFIG.selectors.hero);
    const indicators = queryAll(CONFIG.selectors.heroIndicators);
    const heroImage = query(CONFIG.selectors.heroImage);

    if (!hero) return;

    // Indicator Logic
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            const slideId = this.getAttribute('data-hero-slide');
            
            // Update UI state (CSS handles transitions)
            indicators.forEach(i => {
                i.classList.remove(CONFIG.classes.isActive);
                i.setAttribute('aria-selected', 'false');
            });
            
            this.classList.add(CONFIG.classes.isActive);
            this.setAttribute('aria-selected', 'true');
            
            // Note: Actual image switching logic would go here if assets were present.
            // Currently, we maintain structural readiness.
        });
    });

    // Subtle Pointer Parallax
    if (!STATE.prefersReducedMotion && heroImage) {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (!isTouch) {
            hero.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { innerWidth, innerHeight } = window;
                
                const moveX = (clientX - innerWidth / 2) * 0.01;
                const moveY = (clientY - innerHeight / 2) * 0.01;
                
                // Constrain movement to 8px max
                const translateX = Math.max(-8, Math.min(8, moveX));
                const translateY = Math.max(-8, Math.min(8, moveY));
                
                heroImage.style.transform = `scale(1.05) translate(${translateX}px, ${translateY}px)`;
            });

            hero.addEventListener('mouseleave', () => {
                heroImage.style.transform = 'scale(1) translate(0, 0)';
            });
        }
    }
};

/**
 * NEWSLETTER FORM
 */
const initNewsletter = () => {
    const form = query(CONFIG.selectors.newsletterForm);
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = query(CONFIG.selectors.newsletterEmail);
        const email = emailInput ? emailInput.value.trim() : '';

        // Simple validation
        if (!email || !email.includes('@')) return;

        // Success Mockup
        const originalHTML = form.innerHTML;
        
        // Premium Transition
        form.style.opacity = '0';
        
        setTimeout(() => {
            form.innerHTML = `
                <div class="newsletter-status" aria-live="polite">
                    <p class="status-message">Thanks. You’re part of the M|M family.</p>
                </div>
            `;
            form.style.opacity = '1';
            form.style.transition = 'opacity 0.6s ease';
        }, 300);
    });
};

/**
 * SCROLL REVEAL (Intersection Observer)
 */
const initScrollReveal = () => {
    const revealElements = queryAll(CONFIG.selectors.revealElements);
    
    if (STATE.prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add(CONFIG.classes.isVisible));
        return;
    }

    const observerOptions = {
        threshold: CONFIG.thresholds.reveal,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(CONFIG.classes.isVisible);
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
};

/**
 * IMAGE HANDLING
 */
const initImageHandling = () => {
    const images = queryAll('img');

    images.forEach(img => {
        // Handle native lazy loading transitions if CSS supports it
        if (img.complete) {
            img.classList.add('is-loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('is-loaded');
            });
        }

        // Lightweight error fallback
        img.addEventListener('error', function() {
            this.style.opacity = '0';
            const wrapper = this.closest('.product-card-media, .category-media, .hero-media');
            if (wrapper) {
                wrapper.style.backgroundColor = '#f1eee8'; // Muted brand off-white
            }
        });
    });
};

/**
 * ACCESSIBILITY & SMOOTH SCROLL
 */
const initAccessibility = () => {
    // Smooth Anchor Scrolling
    const anchors = queryAll(CONFIG.selectors.anchorLinks);
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = query(targetId);
            if (targetEl) {
                e.preventDefault();
                
                const behavior = STATE.prefersReducedMotion ? 'auto' : 'smooth';
                const headerOffset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: behavior
                });

                // Set focus for screen readers
                targetEl.setAttribute('tabindex', '-1');
                targetEl.focus({ preventScroll: true });
            }
        });
    });

    // Add a "js-enabled" class to body for CSS progressive enhancement
    document.body.classList.add('js-ready');
};

/**
 * INITIALIZATION
 */
const init = () => {
    initAccessibility();
    initAnnouncement();
    initNavigation();
    initHeaderScroll();
    initHero();
    initNewsletter();
    initScrollReveal();
    initImageHandling();
};

// DOM Ready execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}