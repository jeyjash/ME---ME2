/**
 * ME & ME - Public About Page
 * File: js/about.js
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'meMeAboutHeroImage';

    function loadAboutImage() {
        const image = document.querySelector('[data-about-hero-image]');

        if (!image) return;

        const savedImage = localStorage.getItem(STORAGE_KEY);

        if (savedImage) {
            image.src = savedImage;
        }
    }

    document.addEventListener('DOMContentLoaded', loadAboutImage);

})();