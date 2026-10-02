/**
 * ME & ME WEBSITE — filters.js
 * Shop filtering and sorting system.
 *
 * Responsibilities:
 * - Store current filter state
 * - Build category options from product data
 * - Filter products by category
 * - Sort products
 * - Expose filtered results to the Shop page
 */

(() => {
    "use strict";

    const state = {
        category: "all",
        sort: "featured",
        searchTerm: ""
    };

    const getProducts = () => {
        if (!window.ProductsStore || !ProductsStore.isLoaded()) {
            return [];
        }

        return ProductsStore.getProducts();
    };

    const normalize = (value) => {
        return String(value || "")
            .trim()
            .toLowerCase();
    };

    const matchesSearch = (product) => {
        if (!state.searchTerm) {
            return true;
        }

        const search = normalize(state.searchTerm);

        const searchableText = [
            product.name,
            product.category,
            product.description,
            product.collection
        ]
            .filter(Boolean)
            .map(normalize)
            .join(" ");

        return searchableText.includes(search);
    };

    const matchesCategory = (product) => {
        if (state.category === "all") {
            return true;
        }

        return normalize(product.category) === normalize(state.category);
    };

    const sortProducts = (products) => {
        const sorted = [...products];

        switch (state.sort) {
            case "price-low":
                return sorted.sort((a, b) => a.price - b.price);

            case "price-high":
                return sorted.sort((a, b) => b.price - a.price);

            case "name":
                return sorted.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

            case "newest":
                return sorted.sort((a, b) => {
                    return Number(b.is_new_arrival) - Number(a.is_new_arrival);
                });

            case "featured":
            default:
                return sorted.sort((a, b) => {
                    return Number(b.is_featured) - Number(a.is_featured);
                });
        }
    };

    const getFilteredProducts = () => {
        const products = getProducts();

        const filtered = products.filter((product) => {
            return (
                matchesCategory(product) &&
                matchesSearch(product)
            );
        });

        return sortProducts(filtered);
    };

    const getCategories = () => {
        const products = getProducts();

        const categories = products
            .map((product) => product.category)
            .filter(Boolean)
            .map((category) => String(category).trim());

        return [...new Set(categories)];
    };

    const setCategory = (category) => {
        state.category = category || "all";
    };

    const setSort = (sort) => {
        state.sort = sort || "featured";
    };

    const setSearchTerm = (term) => {
        state.searchTerm = String(term || "").trim();
    };

    const getState = () => {
        return Object.freeze({
            category: state.category,
            sort: state.sort,
            searchTerm: state.searchTerm
        });
    };

    const reset = () => {
        state.category = "all";
        state.sort = "featured";
        state.searchTerm = "";
    };

    window.MeMeFilters = Object.freeze({
        getFilteredProducts,
        getCategories,
        setCategory,
        setSort,
        setSearchTerm,
        getState,
        reset
    });
})();