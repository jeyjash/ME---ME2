/**
 * ME & ME WEBSITE — whatsapp.js
 * WhatsApp order-link system.
 *
 * Responsibilities:
 * - Build the customer order message
 * - Encode the message safely
 * - Generate a WhatsApp order URL
 * - Handle missing optional product selections
 */

(() => {
    "use strict";

    const CONFIG = {
        /*
         * Replace this placeholder with the brand's real WhatsApp
         * number during final configuration.
         *
         * Format:
         * Country code + number
         * No +, spaces, brackets, or leading zero.
        
         */
        phoneNumber: "265984391755"
    };

    const formatSelection = (label, value) => {
        if (!value) {
            return "";
        }

        return `${label}: ${value}\n`;
    };

    const buildOrderMessage = ({
        product,
        quantity = 1,
        color = null,
        size = null
    }) => {
        if (!product) {
            return "";
        }

        const price = MeMeUtils.formatPrice(
            product.price,
            product.currency || "MWK"
        );

        const lines = [
            "Hello ME & ME, I'd like to place an order.",
            "",
            `Product: ${product.name}`,
            `Price: ${price}`,
            `Quantity: ${quantity}`,
            formatSelection("Color", color).trimEnd(),
            formatSelection("Size", size).trimEnd(),
            "",
            "Please confirm availability and the next steps."
        ];

        return lines
            .filter((line) => line !== "")
            .join("\n");
    };

    const createOrderLink = (options = {}) => {
        const message = buildOrderMessage(options);

        if (!message) {
            return "#";
        }

        const encodedMessage = encodeURIComponent(message);

        return `https://wa.me/${CONFIG.phoneNumber}?text=${encodedMessage}`;
    };

    const getPhoneNumber = () => {
        return CONFIG.phoneNumber;
    };

    window.MeMeWhatsApp = Object.freeze({
        buildOrderMessage,
        createOrderLink,
        getPhoneNumber
    });
})();
