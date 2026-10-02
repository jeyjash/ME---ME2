/**
 * ME & ME WEBSITE — shop.js
 * Shop page controller.
 *
 * Responsibilities:
 * - Load product data
 * - Render product cards
 * - Connect filtering and sorting controls
 * - Handle loading and empty states
 * - Support collection filtering from the URL
 */

(() => {
    "use strict";

    const CONFIG = {
       selectors: {
    grid: "#product-grid",
    loading: "#shop-loading",
    empty: "#shop-empty",

    categoryFilter: "#category-filter",
    sortFilter: "#sort-select",
    searchInput: "#shop-search",

    productTemplate: "#product-card-template"
}
    };

    const state = {
        initialized: false
    };

    const getRefs = () => ({
        grid: document.querySelector(CONFIG.selectors.grid),
        loading: document.querySelector(CONFIG.selectors.loading),
        empty: document.querySelector(CONFIG.selectors.empty),

        categoryFilter: document.querySelector(
            CONFIG.selectors.categoryFilter
        ),

        sortFilter: document.querySelector(
            CONFIG.selectors.sortFilter
        ),

        searchInput: document.querySelector(
            CONFIG.selectors.searchInput
        ),

        template: document.querySelector(
            CONFIG.selectors.productTemplate
        )
    });

    const showLoading = (refs) => {
        MeMeUtils.setHidden(refs.loading, false);
        MeMeUtils.setHidden(refs.empty, true);
        MeMeUtils.setHidden(refs.grid, true);
    };

    const showResults = (refs) => {
        MeMeUtils.setHidden(refs.loading, true);
        MeMeUtils.setHidden(refs.grid, false);
    };

    const showEmpty = (refs) => {
        MeMeUtils.setHidden(refs.loading, true);
        MeMeUtils.setHidden(refs.grid, true);
        MeMeUtils.setHidden(refs.empty, false);
    };

    const createProductCard = (product) => {
        const card = document.createElement("article");

        card.className = "product-card";
        card.dataset.productId = product.id;

        const link = document.createElement("a");

        link.className = "product-card__link";
        link.href =
            `product.html?slug=${encodeURIComponent(product.slug)}`;

        const media = document.createElement("div");
        media.className = "product-card__media";

        const image = document.createElement("img");

        image.className = "product-card__image";
        image.src = product.images?.[0] || "";
        image.alt = product.name;
        image.loading = "lazy";
        

        const labels = document.createElement("div");
        labels.className = "product-card__labels";

        if (product.is_new_arrival) {
            const label = document.createElement("span");

            label.className =
                "product-card__label product-card__label--new";

            label.textContent = "New";
            labels.appendChild(label);
        }

        if (product.is_featured) {
            const label = document.createElement("span");

            label.className =
                "product-card__label product-card__label--featured";

            label.textContent = "Featured";
            labels.appendChild(label);
        }

        media.append(image, labels);

        const info = document.createElement("div");
        info.className = "product-card__info";

        const category = document.createElement("p");

        category.className = "product-card__category";
        category.textContent = product.category || "";

        const name = document.createElement("h2");

        name.className = "product-card__name";
        name.textContent = product.name;

        const price = document.createElement("p");

        price.className = "product-card__price";
        price.textContent = MeMeUtils.formatPrice(
            product.price,
            product.currency || "MWK"
        );

        info.append(category, name, price);

        link.append(media, info);
        card.appendChild(link);

        return card;
    };

    const renderProducts = (refs) => {
        if (!refs.grid) {
            return;
        }

        const products = MeMeFilters.getFilteredProducts();

        refs.grid.innerHTML = "";

        if (!products.length) {
            showEmpty(refs);
            return;
        }

        products.forEach((product) => {
            refs.grid.appendChild(
                createProductCard(product)
            );
        });

        showResults(refs);
    };

    const populateCategoryFilter = (refs) => {
        if (!refs.categoryFilter) {
            return;
        }

        const categories = MeMeFilters.getCategories();

        const existingOptions = Array.from(
            refs.categoryFilter.options
        );

        const existingValues = new Set(
            existingOptions.map((option) => option.value)
        );

        categories.forEach((category) => {
            if (existingValues.has(category)) {
                return;
            }

            const option = document.createElement("option");

            option.value = category;
            option.textContent = category;

            refs.categoryFilter.appendChild(option);
        });
    };

    const applyUrlCollectionFilter = () => {
        const collection =
            MeMeUtils.getQueryParam("collection");

        if (!collection) {
            return;
        }

        /*
         * Collection filtering is added to the filter engine
         * separately so the normal category/search/sort system
         * remains independent.
         */
        MeMeFilters.setCollection(collection);
    };

    const bindControls = (refs) => {
        refs.categoryFilter?.addEventListener("change", (event) => {
            MeMeFilters.setCategory(event.target.value);
            renderProducts(refs);
        });

        refs.sortFilter?.addEventListener("change", (event) => {
            MeMeFilters.setSort(event.target.value);
            renderProducts(refs);
        });

        document.addEventListener(
            "mememe:products-filtered",
            () => {
                renderProducts(refs);
            }
        );
    };

    const init = async () => {
        const refs = getRefs();

        if (!refs.grid) {
            return;
        }

        if (
            !window.MeMeUtils ||
            !window.MeMeFilters ||
            !window.ProductsStore
        ) {
            console.error(
                "ME & ME - Shop dependencies are missing."
            );

            return;
        }

        showLoading(refs);

        await ProductsStore.load();

        if (ProductsStore.getError()) {
            showEmpty(refs);
            return;
        }

        populateCategoryFilter(refs);
        applyUrlCollectionFilter();
        bindControls(refs);

        renderProducts(refs);

        state.initialized = true;
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }
})();