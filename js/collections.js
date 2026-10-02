/**
 * ME & ME WEBSITE — collections.js
 * Collections page controller.
 *
 * Responsibilities:
 * - Load collection data
 * - Render the featured collection
 * - Render collection cards
 * - Handle loading and empty states
 */

(() => {
    "use strict";

    const CONFIG = {
        dataUrl: "/data/collections.json",

        selectors: {
            loading: "#collections-loading",
            empty: "#collections-empty",
            grid: "[data-collection-grid]",

            featureImage: "[data-collection-image]",
            featureTitle: ".editorial-title",
            featureDescription: ".editorial-description",
            featureLink: ".editorial-link"
        }
    };

    const state = {
        collections: []
    };

    const getRefs = () => ({
        loading: document.querySelector(CONFIG.selectors.loading),
        empty: document.querySelector(CONFIG.selectors.empty),
        grid: document.querySelector(CONFIG.selectors.grid),

        featureImage: document.querySelector(CONFIG.selectors.featureImage),
        featureTitle: document.querySelector(CONFIG.selectors.featureTitle),
        featureDescription: document.querySelector(CONFIG.selectors.featureDescription),
        featureLink: document.querySelector(CONFIG.selectors.featureLink)
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

    const loadCollections = async () => {
        const response = await fetch(CONFIG.dataUrl);

        if (!response.ok) {
            throw new Error(
                `Failed to load collections: ${response.status}`
            );
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.collections)) {
            throw new Error(
                "Invalid collections data: 'collections' array not found."
            );
        }

        return data.collections;
    };

    const renderFeaturedCollection = (refs) => {
        const featured =
            state.collections.find((collection) => collection.is_featured) ||
            state.collections[0];

        if (!featured) {
            return;
        }

        if (refs.featureImage) {
            refs.featureImage.src = featured.image || "";
            refs.featureImage.alt = featured.name || "Featured collection";
        }

        if (refs.featureTitle) {
            refs.featureTitle.textContent = featured.name || "";
        }

        if (refs.featureDescription) {
            refs.featureDescription.textContent =
                featured.description || "";
        }

        if (refs.featureLink) {
            refs.featureLink.href =
                `shop.html?collection=${encodeURIComponent(featured.slug)}`;
        }
    };

    const createCollectionCard = (collection) => {
        const article = document.createElement("article");

        article.className = "collection-card";
        article.dataset.collectionSlug = collection.slug || "";

        const link = document.createElement("a");

        link.className = "collection-card__link";
        link.href =
            `shop.html?collection=${encodeURIComponent(collection.slug || "")}`;

        const media = document.createElement("div");
        media.className = "collection-card__media";

        const image = document.createElement("img");

        image.className = "collection-card__image";
        image.src = collection.image || "";
        image.alt = collection.name || "Collection";
        image.loading = "lazy";

        media.appendChild(image);

        const content = document.createElement("div");
        content.className = "collection-card__content";

        const name = document.createElement("h3");
        name.className = "collection-card__title";
        name.textContent = collection.name || "";

        const description = document.createElement("p");
        description.className = "collection-card__description";
        description.textContent = collection.description || "";

        content.append(name, description);
        link.append(media, content);
        article.appendChild(link);

        return article;
    };

    const renderGrid = (refs) => {
        if (!refs.grid) return;

        refs.grid.innerHTML = "";

        state.collections.forEach((collection) => {
            refs.grid.appendChild(
                createCollectionCard(collection)
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
            state.collections = await loadCollections();

            if (!state.collections.length) {
                showEmpty(refs);
                return;
            }

            renderFeaturedCollection(refs);
            renderGrid(refs);

            showContent(refs);
        } catch (error) {
            console.error(
                "ME & ME - Collections Error:",
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