/**
 * ME & ME WEBSITE — utils.js
 * Shared utility functions used across the website.
 */

(() => {
    "use strict";

    const qs = (selector, parent = document) => {
        return parent.querySelector(selector);
    };

    const qsa = (selector, parent = document) => {
        return Array.from(parent.querySelectorAll(selector));
    };

    const getQueryParam = (key) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(key);
    };

    const getCurrentPath = () => {
        return window.location.pathname;
    };

    const formatPrice = (price, currency = "MWK") => {
        if (typeof price !== "number" || Number.isNaN(price)) {
            return "";
        }

        try {
            return new Intl.NumberFormat("en-MW", {
                style: "currency",
                currency,
                maximumFractionDigits: 0
            }).format(price);
        } catch (error) {
            return `${currency} ${price.toLocaleString()}`;
        }
    };

    const escapeHTML = (value) => {
        if (typeof value !== "string") {
            return "";
        }

        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const setHidden = (element, hidden) => {
        if (!element) return;

        element.classList.toggle("is-hidden", hidden);
        element.setAttribute("aria-hidden", hidden ? "true" : "false");
    };

    const debounce = (callback, delay = 250) => {
        let timeoutId;

        return (...args) => {
            window.clearTimeout(timeoutId);

            timeoutId = window.setTimeout(() => {
                callback(...args);
            }, delay);
        };
    };

    const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };

    const createElement = (html) => {
        const template = document.createElement("template");
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    };

    window.MeMeUtils = Object.freeze({
        qs,
        qsa,
        getQueryParam,
        getCurrentPath,
        formatPrice,
        escapeHTML,
        setHidden,
        debounce,
        clamp,
        createElement
    });
})();