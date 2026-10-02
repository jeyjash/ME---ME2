/**
 * ME & ME — NAVIGATION.JS
 * DEDICATED NAVIGATION & MOBILE MENU SYSTEM
 * 
 * Responsibilities:
 * - Mobile menu state (open/close/toggle)
 * - Aria-attributes management
 * - Body scroll locking (preserving previous state)
 * - Keyboard accessibility (Escape key)
 * - Outside click detection
 * - Mobile/Desktop breakpoint handling
 */

(function () {
    'use strict';

    /* ============================================================
       1. CONFIGURATION
       ============================================================ */
    const CONFIG = {
        selectors: {
            menuToggle: '[data-menu-toggle]',
            mainNav: '.main-navigation',
            navLinks: '.nav-link',
            header: '.site-header'
        },
        breakpoints: {
            mobile: '(max-width: 1024px)'
        },
        classes: {
            menuOpen: 'menu-is-open'
        }
    };

    /* ============================================================
       2. STATE
       ============================================================ */
    const STATE = {
        isMobile: false,
        isMenuOpen: false,
        previousOverflow: '',
        refs: {
            toggle: null,
            nav: null,
            links: [],
            body: document.body
        }
    };

    /* ============================================================
       3. CORE METHODS
       ============================================================ */

    /**
     * Checks the viewport against the mobile breakpoint.
     */
    const updateDeviceContext = () => {
        STATE.isMobile = window.matchMedia(CONFIG.breakpoints.mobile).matches;
    };

    /**
     * Manages the body overflow to prevent background scrolling.
     * Preserves the previous overflow state to avoid layout destruction.
     */
   const setBodyScrollLock = (lock) => {
    if (lock) {
        STATE.previousOverflow = STATE.refs.body.style.overflow;
        STATE.refs.body.style.overflow = 'hidden';
    } else {
        STATE.refs.body.style.overflow = STATE.previousOverflow;
    }
};

    /**
     * Synchronizes ARIA attributes for screen readers.
     */
    const updateAria = (isOpen) => {
        if (!STATE.refs.toggle) return;
        STATE.refs.toggle.setAttribute('aria-expanded', isOpen);
        STATE.refs.toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    };

    /**
     * Opens the mobile navigation menu.
     */
    const openMenu = () => {
        if (STATE.isMenuOpen) return;

        STATE.isMenuOpen = true;
        STATE.refs.body.classList.add(CONFIG.classes.menuOpen);
        setBodyScrollLock(true);
        updateAria(true);
    };

    /**
     * Closes the mobile navigation menu.
     */
    const closeMenu = () => {
        if (!STATE.isMenuOpen) return;

        STATE.isMenuOpen = false;
        STATE.refs.body.classList.remove(CONFIG.classes.menuOpen);
        setBodyScrollLock(false);
        updateAria(false);
    };

    /**
     * Toggles the menu state.
     */
    const toggleMenu = () => {
        if (STATE.isMobile) {
            STATE.isMenuOpen ? closeMenu() : openMenu();
        }
    };

    /* ============================================================
       4. EVENT HANDLERS
       ============================================================ */

    /**
     * Closes menu when a navigation link is clicked.
     */
    const handleLinkClick = () => {
        if (STATE.isMobile && STATE.isMenuOpen) {
            closeMenu();
        }
    };

    /**
     * Closes menu when Escape key is pressed.
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && STATE.isMenuOpen) {
            closeMenu();
            STATE.refs.toggle?.focus();
        }
    };

    /**
     * Closes menu if user clicks outside the navigation/header area.
     */
    const handleOutsideClick = (e) => {
        if (!STATE.isMenuOpen || !STATE.isMobile) return;

       const isClickInsideNav = STATE.refs.nav?.contains(e.target);
       const isClickInsideToggle = STATE.refs.toggle?.contains(e.target);

        if (!isClickInsideNav && !isClickInsideToggle) {
            closeMenu();
        }
    };

    /**
     * Responds to window resizing to update mobile/desktop state.
     */
    const handleResize = () => {
        const wasMobile = STATE.isMobile;
        updateDeviceContext();

        // If we switched from mobile to desktop, ensure menu is closed
        if (wasMobile && !STATE.isMobile && STATE.isMenuOpen) {
            closeMenu();
        }
    };

    /* ============================================================
       5. INITIALIZATION
       ============================================================ */

    const init = () => {
        // Cache DOM elements
        STATE.refs.toggle = document.querySelector(CONFIG.selectors.menuToggle);
        STATE.refs.nav = document.querySelector(CONFIG.selectors.mainNav);
        STATE.refs.links = Array.from(document.querySelectorAll(CONFIG.selectors.navLinks));

        // Safety check: If no toggle is found, the module has nothing to do.
        if (!STATE.refs.toggle) return;

        // Set initial states
        updateDeviceContext();
        updateAria(false);

        // Attach Listeners
        STATE.refs.toggle.addEventListener('click', toggleMenu);
        
        STATE.refs.links.forEach(link => {
            link.addEventListener('click', handleLinkClick);
        });

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleOutsideClick);
        window.addEventListener('resize', debounce(handleResize, 150), { passive: true });
    };

    /**
     * Debounce utility for performance.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Boot module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();