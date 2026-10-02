/**
 * ME & ME WEBSITE — animations.js
 * Dedicated motion/reveal system.
 */

(() => {
  "use strict";

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /**
   * Injects minimal required CSS to handle the transition states.
   * This ensures high performance via CSS transitions rather than JS loops.
   */
  const injectStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .js-animations-enabled [data-reveal] {
        opacity: 0;
        transition-property: opacity, transform, clip-path;
        transition-duration: 700ms;
        transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        will-change: opacity, transform;
      }

      [data-reveal="up"] { transform: translateY(30px); }
      [data-reveal="scale"] { transform: scale(0.95); }
      [data-reveal="image"] { clip-path: inset(10% 10% 10% 10%); }

      .js-animations-enabled [data-reveal].is-revealed {
        opacity: 1 !important;
        transform: translate(0, 0) scale(1) !important;
        clip-path: inset(0% 0% 0% 0%) !important;
      }

      @media (prefers-reduced-motion: reduce) {
        .js-animations-enabled [data-reveal] {
          opacity: 1 !important;
          transform: none !important;
          clip-path: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  /**
   * Handles the reveal logic for an individual element.
   * @param {HTMLElement} el 
   */
  const revealElement = (el) => {
    el.classList.add("is-revealed");
  };

  /**
   * Applies stagger delays to children of containers marked with data-reveal-stagger.
   */
  const applyStaggering = () => {
    const staggerContainers = document.querySelectorAll("[data-reveal-stagger]");
    
    staggerContainers.forEach((container) => {
      const staggerVal = parseInt(container.getAttribute("data-reveal-stagger"), 10);
      if (isNaN(staggerVal)) return;

      const children = container.querySelectorAll("[data-reveal]");
      
      children.forEach((child, index) => {
        const baseDelay = parseInt(child.getAttribute("data-reveal-delay") || "0", 10);
        const totalDelay = baseDelay + (index * staggerVal);
        child.style.transitionDelay = `${totalDelay}ms`;
      });
    });
  };

  const init = () => {
    document.documentElement.classList.add("js-animations-enabled");
    injectStyles();
    applyStaggering();

    const allRevealables = document.querySelectorAll("[data-reveal]");

    // Handle Reduced Motion: Reveal everything immediately
    if (motionQuery.matches) {
      allRevealables.forEach((el) => {
        if (el.tagName === "IMG" && el.getAttribute("data-reveal") === "image") {
          if (el.complete) {
            revealElement(el);
          } else {
            el.addEventListener("load", () => revealElement(el), { once: true });
            el.addEventListener("error", () => revealElement(el), { once: true });
          }
        } else {
          revealElement(el);
        }
      });
      return;
    }

    // Standard Reveal Logic via IntersectionObserver
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          revealElement(el);
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    allRevealables.forEach((el) => {
      // Special handling for image-type reveals to wait for load or error
      if (el.tagName === "IMG" && el.getAttribute("data-reveal") === "image") {
        if (el.complete) {
          revealElement(el);
        } else {
          el.addEventListener("load", () => revealElement(el), { once: true });
          el.addEventListener("error", () => revealElement(el), { once: true });
        }
      } else {
        observer.observe(el);
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();