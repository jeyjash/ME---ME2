/**
 * ME & ME WEBSITE — lookbook.js
 * Lookbook page controller.
 *
 * Responsibilities:
 * - Load lookbook data
 * - Render the featured editorial image
 * - Render lookbook gallery items
 * - Handle loading and empty states
 */

(() => {
    "use strict";

    const CONFIG = {
        dataUrl: "/data/lookbook.json",

       selectors: {
    loading: "#lookbook-loading",
    empty: "#lookbook-empty",
    grid: "[data-lookbook-grid]",

    featureImage: "[data-lookbook-feature-image]",
    featureTitle: ".lookbook-feature-title",
    featureDescription: ".lookbook-feature-description"
},
    };

    const state = {
        entries: []
    };

    const getRefs = () => ({
        loading: document.querySelector(CONFIG.selectors.loading),
        empty: document.querySelector(CONFIG.selectors.empty),
        grid: document.querySelector(CONFIG.selectors.grid),

        featureImage: document.querySelector(CONFIG.selectors.featureImage),
        featureTitle: document.querySelector(CONFIG.selectors.featureTitle),
        featureDescription: document.querySelector(
            CONFIG.selectors.featureDescription
        )
    });

    const showLoading = (refs) => {
        MeMeUtils.setHidden(refs.loading, false);
        MeMeUtils.setHidden(refs.empty, true);
    };

    const showEmpty = (refs) => {
        MeMeUtils.setHidden(refs.loading, true);
        MeMeUtils.setHidden(refs.empty, false);
    };

    const showContent = (refs) => {
        MeMeUtils.setHidden(refs.loading, true);
        MeMeUtils.setHidden(refs.empty, true);
    };

    const loadLookbook = async () => {
        const response = await fetch(CONFIG.dataUrl);

        if (!response.ok) {
            throw new Error(
                `Failed to load lookbook: ${response.status}`
            );
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.entries)) {
            throw new Error(
                "Invalid lookbook data: 'entries' array not found."
            );
        }

        return data.entries;
    };

    const renderFeaturedEntry = (refs) => {
        const featured =
            state.entries.find((entry) => entry.is_featured) ||
            state.entries[0];

        if (!featured) {
            return;
        }

        if (refs.featureImage) {
            refs.featureImage.src = featured.image || "";
            refs.featureImage.alt =
                featured.alt || featured.title || "ME & ME Lookbook";
        }

        if (refs.featureTitle) {
            refs.featureTitle.textContent =
                featured.title || "";
        }

        if (refs.featureDescription) {
            refs.featureDescription.textContent =
                featured.description || "";
        }
    };

   const createLookbookCard = (entry) => {
    const article = document.createElement("article");

    article.className = "lookbook-item";
    article.dataset.lookbookId = entry.id || "";

    const layout = entry.layout || "medium";

    if (
        layout === "large" ||
        layout === "medium" ||
        layout === "wide"
    ) {
        article.classList.add(`lookbook-item--${layout}`);
    } else {
        article.classList.add("lookbook-item--medium");
    }

    const image = document.createElement("img");

    image.src = entry.image || "";
    image.alt =
        entry.alt ||
        entry.title ||
        "ME & ME Lookbook image";
    image.loading = "lazy";

    article.appendChild(image);

    return article;
};

    const renderGrid = (refs) => {
        if (!refs.grid) {
            return;
        }

        refs.grid.innerHTML = "";

        state.entries.forEach((entry) => {
            refs.grid.appendChild(
                createLookbookCard(entry)
            );
        });
    };

    const init = async () => {
        const refs = getRefs();

        if (!refs.grid) {
            return;
        }

        showLoading(refs);

        try {
            state.entries = await loadLookbook();

            if (!state.entries.length) {
                showEmpty(refs);
                return;
            }

            renderFeaturedEntry(refs);
            renderGrid(refs);

            showContent(refs);
        } catch (error) {
            console.error(
                "ME & ME - Lookbook Error:",
                error.message
            );

            showEmpty(refs);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();