/*!
 * weld.js v3.x (https://github.com/eastcitysoftware/weld)
 * Copyright 2025 East City Software, Pim Brouwers
 * Licensed under Apache 2.0 (https://github.com/eastcitysoftware/weld/blob/master/LICENSE)
 */
(function (GLOBAL) {
    'use strict';

    const weld = {
        _binders: {},
        apply(el = document.body) { applyBindings(el); },
        bind(name, fn) { addBinder(name, fn); },
        dom: {
            append(el, children) { appendElements(el, children); },
            find(selector, el = document.body) { return el.querySelectorAll(selector); },
            get(selector, el = document.body) { return el.querySelector(selector); },
            set(el, children) { replaceElements(el, children); }
        },
        el(tagOrElement, props, textContent) { return createOrModifyElement(tagOrElement, props, textContent); }
    };

    function applyBindings(root) {
        const els = root.querySelectorAll('[data-wd-bind], [wd-bind]');

        for (const el of els) {
            const name = el.getAttribute('data-wd-bind') || el.getAttribute('wd-bind');
            if (!name || !weld._binders[name]) continue;

            const attr = parseDataAttr(el.getAttribute('data-wd-attr') || el.getAttribute('wd-attr'));

            let targets = {};
            const targetEls = el.querySelectorAll('[data-wd-target], [wd-target]');
            for (const targetEl of targetEls) {
                const targetName = targetEl.getAttribute('data-wd-target') || targetEl.getAttribute('wd-target');
                targets[targetName] = targetEl;
            }

            if (attr === null) {
                weld._binders[name](el, targets);
            }
            else {
                weld._binders[name](el, attr, targets);
            }
        }
    }

    function parseDataAttr(value) {
        if (!value) {
            return null;
        }

        let bindingJson = "";
        if (value.startsWith('{')) {
            bindingJson =
                value
                    .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
                    .replace(/(:\s*)'([\w\s\n\r!"#$%&()*+,-./:<=>?@[\]^_`{|}~]+)'/g, '$1"$2"');
        }
        else if (/^true$/i.test(value)) {
            bindingJson = true;
        }
        else if (/^false$/i.test(value)) {
            bindingJson = false;
        }
        else if (/^\d+/.test(value)) {
            bindingJson = parseInt(value);
        }
        else if (/^\d\.+/.test(value)) {
            bindingJson = parseFloat(value);
        }
        else if (/^\w/i.test(value)) {
            bindingJson = `"${value}"`;
        }
        else {
            bindingJson = value;
        }

        try {
            return JSON.parse(`{"__weld__":${bindingJson}}`).__weld__;
        }
        catch (error) {
            console.error('Invalid binding data:', value, error);
            return {};
        }
    }

    function addBinder(name, fn) {
        if (!weld._binders.hasOwnProperty(name)) {
            weld._binders[name] = fn;
        }
    }

    function createOrModifyElement(tagOrElement, textContent, props) {
        const el = typeof tagOrElement === 'string'
            ? createElementFromString(tagOrElement)
            : tagOrElement;

        if (typeof textContent === 'string' || typeof textContent === 'number' || typeof textContent === 'boolean') {
            el.textContent = textContent;
        }
        else if (typeof textContent === 'object') {
            props = textContent;
        }

        if (props && typeof props === 'object') {
            for (const key in props) {
                if (key.startsWith('on') && typeof props[key] === 'function') {
                    el.addEventListener(key.slice(2).toLowerCase(), props[key]);
                }
                else if (key in el && el[key] !== props[key]) {
                    el[key] = props[key];
                }
                else if (!el.hasAttribute(key) || el.getAttribute(key) !== props[key]) {
                    el.setAttribute(key, props[key]);
                }
            }
        }
        return el;
    }

    function createElementFromString(decoratedTag) {
        let tag, id, classes = [];

        const matches = [...decoratedTag.matchAll(/([#.]*)(\w+)/ig)];

        for (const match of matches) {
            if (!id && match[1] === '#') {
                id = match[2];
            }
            else if (match[1] === '.') {
                classes.push(match[2]);
            }
            else if (!tag) {
                tag = match[2];
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

    function appendElements(el, children) {
        if (!Array.isArray(children)) {
            children = [children];
        }

        const fragment = document.createDocumentFragment();

        for (const child of children) {
            if (child == null) {
                continue;
            }
            fragment.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        }

        el.appendChild(fragment);
    }

    function replaceElements(el, children) {
        if (!Array.isArray(children)) {
            children = [children];
        }
        el.replaceChildren(...children);
    }

    if (typeof define === 'function' && define.amd) {
        define(() => weld);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = weld;
    } else {
        GLOBAL.weld = weld;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const scriptElements = document.querySelectorAll('script[wd-apply]');
        if (scriptElements.length > 0) {
            weld.apply();
        }
    });
})(this);
