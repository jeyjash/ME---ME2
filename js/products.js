/**
 * ME & ME WEBSITE — products.js
 * Responsible for loading, storing, validating, and providing access to product data.
 */

(() => {
  "use strict";

  // Internal State
  let _products = [];
  let _isLoading = false;
  let _isLoaded = false;
  let _error = null;

  /**
   * Validates the integrity of a product object.
   * Ensures essential fields exist to prevent UI breakage.
   * @param {Object} product 
   * @returns {boolean}
   */
  const isValidProduct = (product) => {
    return (
      product &&
      typeof product.id === "string" &&
      typeof product.slug === "string" &&
      typeof product.name === "string" &&
      typeof product.price === "number" &&
      Array.isArray(product.images)
    );
  };

  /**
   * Fetches and parses the product JSON data.
   * @returns {Promise<void>}
   */
  const loadProducts = async () => {
    _isLoading = true;
    _error = null;

    try {
      // Root-relative path for reliable resolution across all pages
      const response = await fetch("/data/products.json");

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid JSON structure: 'products' array not found.");
      }

      // Validate and filter products
      const validatedProducts = data.products.filter((p) => {
        const valid = isValidProduct(p);
        if (!valid) {
          console.warn("ME & ME - Invalid product entry detected and skipped:", p);
        }
        return valid;
      });

      // Protect internal state: Freeze each object and the array itself
      // This prevents callers from mutating the data without the overhead of cloning
      validatedProducts.forEach((p) => Object.freeze(p));
      _products = Object.freeze(validatedProducts);
      
      _isLoaded = true;
    } catch (err) {
      _error = err.message;
      _isLoaded = true; 
      console.error("ME & ME - Product Loading Error:", err.message);
    } finally {
      _isLoading = false;
    }
  };

  /**
   * Public API Object
   */
  const ProductsStore = {
    /**
     * Triggers the fetch process.
     * @returns {Promise<void>}
     */
    async load() {
      return await loadProducts();
    },

    /**
     * Returns the protected product array.
     * @returns {Array<Object>}
     */
    getProducts() {
      return _products;
    },

    /**
     * Retrieves a specific product by its unique ID.
     * @param {string} id 
     * @returns {Object|null}
     */
    getProductById(id) {
      const product = _products.find((p) => p.id === id);
      return product || null;
    },

    /**
     * Retrieves a specific product by its URL-friendly slug.
     * @param {string} slug 
     * @returns {Object|null}
     */
    getProductBySlug(slug) {
      const product = _products.find((p) => p.slug === slug);
      return product || null;
    },

    /**
     * Checks if the product data has been successfully loaded.
     * @returns {boolean}
     */
    isLoaded() {
      return _isLoaded;
    },

    /**
     * Checks if the product data is currently being fetched.
     * @returns {boolean}
     */
    isLoading() {
      return _isLoading;
    },

    /**
     * Returns the error message if the load failed.
     * @returns {string|null}
     */
    getError() {
      return _error;
    }
  };

  // Expose to global window object for use in other vanilla JS files
  window.ProductsStore = ProductsStore;

})();