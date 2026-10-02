/**
 * ME & ME WEBSITE — search.js
 * Shop search interaction.
 *
 * Responsibilities:
 * - Listen to the Shop search field
 * - Debounce user input
 * - Update MeMeFilters
 * - Notify the Shop page that results should be refreshed
 */

(() => {
    "use strict";

    const CONFIG = {
    selector: '#shop-search',
    debounceDelay: 250
};

    const init = () => {
        const searchInput = document.querySelector(CONFIG.selector);

        if (!searchInput) {
            return;
        }

        if (!window.MeMeFilters) {
            console.error("ME & ME - Search requires MeMeFilters.");
            return;
        }

        const handleSearch = MeMeUtils.debounce((event) => {
            const searchTerm = event.target.value;

            MeMeFilters.setSearchTerm(searchTerm);

            document.dispatchEvent(
                new CustomEvent("mememe:products-filtered", {
                    detail: {
                        searchTerm
                    }
                })
            );
        }, CONFIG.debounceDelay);

        searchInput.addEventListener("input", handleSearch);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();