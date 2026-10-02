/**
 * ME & ME WEBSITE — product.js
 * Product detail page controller.
 *
 * Responsibilities:
 * - Read the product identifier from the URL
 * - Load the requested product
 * - Render product information
 * - Render gallery thumbnails
 * - Handle color and size selection
 * - Handle quantity
 * - Render stock state
 * - Render related products
 */

(() => {
    "use strict";

    const CONFIG = {
        selectors: {
            loading: "#product-loading",
            notFound: "#product-not-found",
            detail: ".product-detail",

            breadcrumbName: "[data-product-breadcrumb-name]",

            category: "[data-product-category]",
            name: "[data-product-name]",
            price: "[data-product-price]",
            description: "[data-product-description]",
            stock: "[data-product-stock]",

            mainImage: "[data-product-main-image]",
            thumbnails: "[data-product-thumbnails]",
            gallery: "[data-product-gallery]",

            colors: "[data-product-colors]",
            sizes: "[data-product-sizes]",

            quantity: "[data-product-quantity]",
            decreaseQuantity: "[data-quantity-decrease]",
            increaseQuantity: "[data-quantity-increase]",

            whatsapp: "[data-whatsapp-order]",
            relatedProducts: "[data-related-products]"
        }
    };

    const state = {
        product: null,
        selectedColor: null,
        selectedSize: null,
        quantity: 1,
        activeImageIndex: 0
    };

    const getRefs = () => {
        const refs = {};

        Object.entries(CONFIG.selectors).forEach(([key, selector]) => {
            refs[key] = document.querySelector(selector);
        });

        return refs;
    };

    const showLoading = (refs) => {
        MeMeUtils.setHidden(refs.loading, false);
        MeMeUtils.setHidden(refs.notFound, true);
        MeMeUtils.setHidden(refs.detail, true);
    };

    const showProduct = (refs) => {
        MeMeUtils.setHidden(refs.loading, true);
        MeMeUtils.setHidden(refs.notFound, true);
        MeMeUtils.setHidden(refs.detail, false);
    };

    const showNotFound = (refs) => {
        MeMeUtils.setHidden(refs.loading, true);
        MeMeUtils.setHidden(refs.detail, true);
        MeMeUtils.setHidden(refs.notFound, false);
    };

    const getProductIdentifier = () => {
        const slug = MeMeUtils.getQueryParam("slug");

        if (slug) {
            return {
                type: "slug",
                value: slug
            };
        }

        const id = MeMeUtils.getQueryParam("id");

        if (id) {
            return {
                type: "id",
                value: id
            };
        }

        return null;
    };

    const findProduct = () => {
        const identifier = getProductIdentifier();

        if (!identifier) {
            return null;
        }

        if (identifier.type === "slug") {
            return ProductsStore.getProductBySlug(identifier.value);
        }

        return ProductsStore.getProductById(identifier.value);
    };

    const renderBasicInformation = (refs) => {
        const product = state.product;

        refs.breadcrumbName.textContent = product.name;
        refs.category.textContent = product.category || "";
        refs.name.textContent = product.name;
        refs.price.textContent = MeMeUtils.formatPrice(
            product.price,
            product.currency || "MWK"
        );

        refs.description.textContent = product.description || "";
    };

    const renderGallery = (refs) => {
        const product = state.product;
        const images = Array.isArray(product.images)
            ? product.images.filter(Boolean)
            : [];

        refs.thumbnails.innerHTML = "";

        if (!images.length) {
            refs.mainImage.removeAttribute("src");
            refs.mainImage.alt = product.name;
            return;
        }

        state.activeImageIndex = 0;

        const setMainImage = (index) => {
            if (!images[index]) return;

            state.activeImageIndex = index;

            refs.mainImage.src = images[index];
            refs.mainImage.alt = `${product.name} image ${index + 1}`;

            MeMeUtils.qsa(
                ".product-gallery__thumbnail",
                refs.thumbnails
            ).forEach((thumbnail, thumbnailIndex) => {
                const isActive = thumbnailIndex === index;

                thumbnail.classList.toggle(
                    "is-active",
                    isActive
                );

                thumbnail.setAttribute(
                    "aria-current",
                    isActive ? "true" : "false"
                );
            });
        };

        images.forEach((image, index) => {
            const thumbnail = document.createElement("button");

            thumbnail.type = "button";
            thumbnail.className = "product-gallery__thumbnail";
            thumbnail.setAttribute(
                "aria-label",
                `View image ${index + 1}`
            );

            const thumbnailImage = document.createElement("img");

            thumbnailImage.src = image;
            thumbnailImage.alt = "";
            thumbnailImage.loading = "lazy";

            thumbnail.appendChild(thumbnailImage);

            thumbnail.addEventListener("click", () => {
                setMainImage(index);
            });

            refs.thumbnails.appendChild(thumbnail);
        });

        setMainImage(0);
    };

    const renderColors = (refs) => {
        const colors = Array.isArray(state.product.colors)
            ? state.product.colors
            : [];

        refs.colors.innerHTML = "";
        state.selectedColor = null;

        if (!colors.length) {
            refs.colors.closest(".selection-group")?.classList.add("is-hidden");
            return;
        }

        refs.colors.closest(".selection-group")?.classList.remove("is-hidden");

        colors.forEach((color, index) => {
            const value =
                typeof color === "string"
                    ? color
                    : color?.name || color?.value || "";

            if (!value) return;

            const button = document.createElement("button");

            button.type = "button";
            button.className = "product-color";
            button.textContent = value;
            button.dataset.value = value;

            if (index === 0) {
                state.selectedColor = value;
                button.classList.add("is-selected");
                button.setAttribute("aria-pressed", "true");
            } else {
                button.setAttribute("aria-pressed", "false");
            }

            button.addEventListener("click", () => {
                state.selectedColor = value;

                MeMeUtils.qsa(
                    ".product-color",
                    refs.colors
                ).forEach((option) => {
                    const selected = option === button;

                    option.classList.toggle(
                        "is-selected",
                        selected
                    );

                    option.setAttribute(
                        "aria-pressed",
                        selected ? "true" : "false"
                    );
                });

                updateWhatsAppLink(refs);
            });

            refs.colors.appendChild(button);
        });
    };

    const renderSizes = (refs) => {
        const sizes = Array.isArray(state.product.sizes)
            ? state.product.sizes
            : [];

        refs.sizes.innerHTML = "";
        state.selectedSize = null;

        if (!sizes.length) {
            refs.sizes.closest(".selection-group")?.classList.add("is-hidden");
            return;
        }

        refs.sizes.closest(".selection-group")?.classList.remove("is-hidden");

        sizes.forEach((size, index) => {
            const value = String(size || "").trim();

            if (!value) return;

            const button = document.createElement("button");

            button.type = "button";
            button.className = "product-size";
            button.textContent = value;
            button.dataset.value = value;

            if (index === 0) {
                state.selectedSize = value;
                button.classList.add("is-selected");
                button.setAttribute("aria-pressed", "true");
            } else {
                button.setAttribute("aria-pressed", "false");
            }

            button.addEventListener("click", () => {
                state.selectedSize = value;

                MeMeUtils.qsa(
                    ".product-size",
                    refs.sizes
                ).forEach((option) => {
                    const selected = option === button;

                    option.classList.toggle(
                        "is-selected",
                        selected
                    );

                    option.setAttribute(
                        "aria-pressed",
                        selected ? "true" : "false"
                    );
                });

                updateWhatsAppLink(refs);
            });

            refs.sizes.appendChild(button);
        });
    };

    const renderStock = (refs) => {
        const status = state.product.stock_status || "in_stock";

        const messages = {
            in_stock: "In stock",
            out_of_stock: "Out of stock",
            coming_soon: "Coming soon"
        };

        refs.stock.textContent =
            messages[status] || "Availability unavailable";

        refs.stock.dataset.status = status;
    };

    const updateQuantity = (refs, value) => {
        const numericValue = Number.parseInt(value, 10);

        state.quantity = Number.isFinite(numericValue)
            ? Math.max(1, numericValue)
            : 1;

        refs.quantity.value = state.quantity;

        updateWhatsAppLink(refs);
    };

    const initQuantity = (refs) => {
        if (!refs.quantity) return;

        updateQuantity(refs, refs.quantity.value);

        refs.decreaseQuantity?.addEventListener("click", () => {
            updateQuantity(refs, state.quantity - 1);
        });

        refs.increaseQuantity?.addEventListener("click", () => {
            updateQuantity(refs, state.quantity + 1);
        });

        refs.quantity.addEventListener("change", () => {
            updateQuantity(refs, refs.quantity.value);
        });

        refs.quantity.addEventListener("input", () => {
            const value = Number.parseInt(refs.quantity.value, 10);

            if (Number.isFinite(value) && value >= 1) {
                state.quantity = value;
                updateWhatsAppLink(refs);
            }
        });
    };

    const updateWhatsAppLink = (refs) => {
        if (!refs.whatsapp || !window.MeMeWhatsApp) {
            return;
        }

        refs.whatsapp.href = MeMeWhatsApp.createOrderLink({
            product: state.product,
            quantity: state.quantity,
            color: state.selectedColor,
            size: state.selectedSize
        });
    };

    const renderRelatedProducts = (refs) => {
        const container = refs.relatedProducts;

        if (!container) return;

        const allProducts = ProductsStore.getProducts();

        const related = allProducts
            .filter((product) => product.id !== state.product.id)
            .filter((product) => {
                return (
                    product.category === state.product.category ||
                    product.collection === state.product.collection
                );
            })
            .slice(0, 4);

        container.innerHTML = "";

        related.forEach((product) => {
            const card = document.createElement("article");

            card.className = "product-card";
            card.dataset.productId = product.id;

            const link = document.createElement("a");

            link.className = "product-card__link";
            link.href = `product.html?slug=${encodeURIComponent(product.slug)}`;

            const media = document.createElement("div");
            media.className = "product-card__media";

            const image = document.createElement("img");
            image.className = "product-card__image";
            image.src = product.images?.[0] || "";
            image.alt = product.name;
            image.loading = "lazy";

            media.appendChild(image);

            const info = document.createElement("div");
            info.className = "product-card__info";

            const category = document.createElement("p");
            category.className = "product-card__category";
            category.textContent = product.category || "";

            const name = document.createElement("h3");
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
            container.appendChild(card);
        });
    };

    const init = async () => {
        const refs = getRefs();

        if (!refs.detail) {
            return;
        }

        if (!window.ProductsStore) {
            console.error("ME & ME - Product page requires ProductsStore.");
            showNotFound(refs);
            return;
        }

        showLoading(refs);

        if (!ProductsStore.isLoaded()) {
            await ProductsStore.load();
        }

        state.product = findProduct();

        if (!state.product) {
            showNotFound(refs);
            return;
        }

        renderBasicInformation(refs);
        renderGallery(refs);
        renderColors(refs);
        renderSizes(refs);
        renderStock(refs);
        initQuantity(refs);
        renderRelatedProducts(refs);

        showProduct(refs);

        updateWhatsAppLink(refs);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();