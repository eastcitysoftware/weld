/*!
 * weld.js v3.x (https://github.com/eastcitysoftware/weld)
 * Copyright 2026 East City Software, Pim Brouwers
 * Licensed under Apache 2.0 (https://github.com/eastcitysoftware/weld/blob/master/LICENSE)
 */
(function () {
    'use strict';

    // Determine the global object explicitly
    const GLOBAL = typeof self !== 'undefined' ? self // Browser or Web Worker
        : typeof global !== 'undefined' ? global // Node.js
            : typeof window !== 'undefined' ? window // Browser (older environments)
                : this; // Fallback to `this`

    /**
     * The main `weld` object that exposes the public API.
     * @namespace weld
     */
    const weld = {
        _binders: {}, // Registry for binders (functions associated with binding names)

        /**
         * Apply bindings to the DOM, starting from the given root element.
         * @param {HTMLElement} [el=document.body] - The root element to start applying bindings.
         */
        apply(el = document.body) { applyBindings(el); },

        /**
         * Register a new binder with a name and a function.
         * @param {string} name - The name of the binder.
         * @param {Function} fn - The function to execute for the binder.
         */
        bind(name, fn) { addBinder(name, fn); },

        dom: {
            /**
             * Append child elements to a parent element.
             * @param {HTMLElement} el - The parent element.
             * @param {HTMLElement|HTMLElement[]|string} children - The child elements or text to append.
             */
            append(el, children) { appendElements(el, children); },

            /**
             * Find all elements matching a selector within a given root element.
             * @param {string} selector - The CSS selector to match.
             * @param {HTMLElement} [el=document.body] - The root element to search within.
             * @returns {NodeList} A NodeList of matching elements.
             */
            find(selector, el = document.body) {
                return el.querySelectorAll(selector);
            },

            /**
             * Get the first element matching a selector within a given root element.
             * @param {string} selector - The CSS selector to match.
             * @param {HTMLElement} [el=document.body] - The root element to search within.
             * @returns {HTMLElement|null} The first matching element, or null if none found.
             */
            get(selector, el = document.body) {
                return el.querySelector(selector);
            },

            /**
             * Replace the content of an element with new children.
             * @param {HTMLElement} el - The parent element.
             * @param {HTMLElement|HTMLElement[]|string} children - The new children or text to set.
             */
            set(el, children) { replaceElements(el, children); }
        },

        /**
         * Create or modify an element with optional text content and properties.
         * @param {string|HTMLElement} tagOrElement - The tag name or an existing element.
         * @param {string|number|boolean|Object} [textContent] - The text content or properties.
         * @param {Object} [props] - The properties to apply to the element.
         * @returns {HTMLElement} The created or modified element.
         */
        el(tagOrElement, textContent, props) {
            return createOrModifyElement(tagOrElement, textContent, props);
        }
    };

    /**
     * Apply bindings to all elements with the `wd-bind` or `data-wd-bind` attribute.
     * @param {HTMLElement} root - The root element to start applying bindings.
     */
    function applyBindings(root) {
        const els = root.querySelectorAll('[data-wd-bind], [wd-bind]');

        for (const el of els) {
            const name = el.getAttribute('data-wd-bind') || el.getAttribute('wd-bind');
            if (!name || !weld._binders[name]) continue; // Skip if no binder is found

            const attr = parseDataAttr(el.getAttribute('data-wd-attr') || el.getAttribute('wd-attr'));

            // Collect all target elements within the current element
            let targets = {};
            const targetEls = el.querySelectorAll('[data-wd-target], [wd-target]');
            for (const targetEl of targetEls) {
                const targetName = targetEl.getAttribute('data-wd-target') || targetEl.getAttribute('wd-target');
                targets[targetName] = targetEl;
            }

            // Call the binder function with the element, attributes, and targets
            if (attr === null) {
                weld._binders[name](el, targets);
            } else {
                weld._binders[name](el, attr, targets);
            }
        }
    }

    /**
     * Parse the value of a `wd-attr` or `data-wd-attr` attribute into a JavaScript object.
     * @param {string} value - The attribute value to parse.
     * @returns {Object|null} The parsed object, or null if the value is empty.
     */
    function parseDataAttr(value) {
        if (!value) {
            return null; // Return null if the value is empty
        }

        let bindingJson = "";

        value = value.trim();

        // Convert object-like strings into valid JSON
        if (value.startsWith('{') || value.startsWith('[')) {
            bindingJson = convertObjectLiteralToJsonString(value);
        }
        // Handle boolean `true`
        else if (/^true$/i.test(value)) {
            bindingJson = true;
        }
        // Handle boolean `false`
        else if (/^false$/i.test(value)) {
            bindingJson = false;
        }
        // Handle floats
        else if (/^-?\d*\.\d+$/.test(value)) {
            bindingJson = parseFloat(value);
        }
        // Handle integers
        else if (/^-?\d+$/.test(value)) {
            bindingJson = parseInt(value, 10);
        }
        // Handle strings (unquoted)
        else if (/^(?![{[\s])/.test(value)) {
            bindingJson = `"${normalizeQuotes(value)}"`;
        }
        // Fallback for other cases
        else {
            bindingJson = value;
        }

        try {
            // Parse the JSON and return the result
            return JSON.parse(`{"__weld__":${bindingJson}}`).__weld__;
        }
        catch (error) {
            console.error('Invalid binding data:', value, error); // Log errors for invalid JSON
            return {};
        }
    }

    /**
     * Convert an object literal string into a valid JSON string.
     * @param {string} value - The object literal string to convert.
     * @returns {string} The converted JSON string.
     */
    function convertObjectLiteralToJsonString(value) {
        return value
            // Add quotes around keys
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
            // Convert single-quoted strings to double-quoted
            .replace(/'((?:\\.|[^'\\])*)'/g, (_, innerValue) => `"${normalizeQuotes(innerValue)}"`);
    }

    function normalizeQuotes(value) {
        return value
            // Convert single-quoted strings to double-quoted
            .replace(/\\'/g, "'")
            // Escape double quotes
            .replace(/"/g, '\\"');
    }
    /**
     * Add a new binder to the registry.
     * @param {string} name - The name of the binder.
     * @param {Function} fn - The function to execute for the binder.
     */
    function addBinder(name, fn) {
        if (!weld._binders.hasOwnProperty(name)) {
            weld._binders[name] = fn;
        }
    }

    /**
     * Create a new element or modify an existing one.
     * @param {string|HTMLElement} tagOrElement - The tag name or an existing element.
     * @param {string|number|boolean|Object} [textContent] - The text content or properties.
     * @param {Object} [props] - The properties to apply to the element.
     * @returns {HTMLElement} The created or modified element.
     */
    function createOrModifyElement(tagOrElement, textContent, props) {
        const el = typeof tagOrElement === 'string'
            ? createElementFromString(tagOrElement) // Create a new element from a tag string
            : tagOrElement; // Use the existing element

        // Set the text content if provided
        if (typeof textContent === 'string' || typeof textContent === 'number' || typeof textContent === 'boolean') {
            el.textContent = textContent.toString();
        }
        else if (typeof textContent === 'object') {
            props = textContent; // Treat `textContent` as `props` if it's an object
        }

        // Apply properties to the element
        if (props && typeof props === 'object') {
            for (const key in props) {
                if (key.startsWith('on') && typeof props[key] === 'function') {
                    // Add event listeners for `on*` properties
                    el.addEventListener(key.slice(2).toLowerCase(), props[key]);
                }
                else if (key in el && el[key] !== props[key]) {
                    // Set DOM properties directly
                    el[key] = props[key];
                }
                else if (!el.hasAttribute(key) || el.getAttribute(key) !== props[key]) {
                    // Set attributes if they differ
                    el.setAttribute(key, props[key]);
                }
            }
        }
        return el;
    }

    /**
     * Create an element from a decorated tag string (e.g., "div#id.class1.class2").
     * @param {string} decoratedTag - The tag string with optional ID and classes.
     * @returns {HTMLElement} The created element.
     */
    function createElementFromString(decoratedTag) {
        let tag, id, classes = [];

        const matches = [...decoratedTag.matchAll(/([#.]*)(\w+)/ig)];

        for (const match of matches) {
            if (!id && match[1] === '#') {
                id = match[2]; // Extract the ID
            }
            else if (match[1] === '.') {
                classes.push(match[2]); // Extract classes
            }
            else if (!tag) {
                tag = match[2]; // Extract the tag name
            }
        }

        const el = document.createElement(tag);

        if (id) {
            el.id = id;
        }

        if (classes.length) {
            el.classList.add(...classes);
        }

        return el;
    }

    /**
     * Append child elements to a parent element.
     * @param {HTMLElement} el - The parent element.
     * @param {HTMLElement|HTMLElement[]|string} children - The child elements or text to append.
     */
    function appendElements(el, children) {
        if (!Array.isArray(children)) {
            children = [children]; // Normalize to an array
        }

        const fragment = document.createDocumentFragment();

        for (const child of children) {
            if (child == null) {
                continue; // Skip null or undefined children
            }
            fragment.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        }

        el.appendChild(fragment);
    }

    /**
     * Replace the content of an element with new children.
     * @param {HTMLElement} el - The parent element.
     * @param {HTMLElement|HTMLElement[]|string} children - The new children or text to set.
     */
    function replaceElements(el, children) {
        if (!Array.isArray(children)) {
            children = [children]; // Normalize to an array
        }
        el.replaceChildren(...children);
    }

    // Export the library for different environments
    if (typeof define === 'function' && define.amd) {
        define(() => weld); // AMD
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = weld; // CommonJS
    } else {
        GLOBAL.weld = weld; // Global
    }

    // Auto-apply bindings if the `wd-apply` attribute is present on a script tag
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            const scriptElements = document.querySelectorAll('script[wd-apply]');
            if (scriptElements.length > 0) {
                weld.apply();
            }
        });
    }
})();