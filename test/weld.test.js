const weld = require('../src/index');
const { GlobalRegistrator } = require('@happy-dom/global-registrator');
const { beforeAll, test, expect } = require('bun:test');

// need to run this before all/any tests run
beforeAll(() => {
    GlobalRegistrator.register();
});

const createTestElement = (bindingName, bindingAttr) => {
    let props = { 'wd-bind': bindingName };

    if (bindingAttr) {
        props = Object.assign(props, { 'wd-attr': bindingAttr });
    }

    return weld.el('div', props);
};

test('empty binding', function () {
    const binder = 'testEmpty';
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder));
    weld.bind(binder, function (el) {
        expect(true).toBe(true);
    });
    weld.apply(rootEl);
});

test('string binding single quotes', function () {
    const binder = "testStringSingleQuotes";
    const expected = "here";
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr).toBe(expected);
    });
    weld.apply(rootEl);
});

test('string binding double quotes', function () {
    const binder = "testStringQuotes";
    const expected = "here";
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr).toBe(expected);
    });
    weld.apply(rootEl);
});

test('string binding no quotes', function () {
    const binder = "testStringNoQuotes";
    const expected = "here";
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr).toBe(expected);
    });
    weld.apply(rootEl);
});

test('float binding value', function () {
    const binder = "testInt";
    const expected = 1;
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr).toBe(expected);
    });
    weld.apply(rootEl);
});

test('int binding value', function () {
    const binder = "testFloat";
    const expected = 1.0;
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr).toBe(expected);
    });
    weld.apply(rootEl);
});

test('boolean binding value', function () {
    const binder = "testBoolean";
    const expected = true;
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr).toBe(expected);
    });
    weld.apply(rootEl);
});

test('object literal binding value', function () {
    const binder = "testObjectLiteral";
    const expected = "{ name: 'weld', version: 1, awesome: true }";
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr.name).toBe('weld');
        expect(attr.version).toBe(1);
        expect(attr.awesome).toBe(true);
    });
    weld.apply(rootEl);
});

test('JSON binding value', function () {
    const binder = "testJsonLiteral";
    const expected = JSON.stringify({ name: "weld", "version": 1, "awesome": true });
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr.name).toBe('weld');
        expect(attr.version).toBe(1);
        expect(attr.awesome).toBe(true);
    });
    weld.apply(rootEl);
});

test('array binding value', function () {
    const binder = "arrayLiteral";
    const expected = "[1,2,3]";
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement(binder, expected));
    weld.bind(binder, function (el, attr) {
        expect(attr).toBeInstanceOf(Array);
        expect(attr.length).toBe(3);
    });
    weld.apply(rootEl);
});


test('single target', function () {
    const binder = "testTarget";
    const parentElement = createTestElement(binder);
    parentElement.innerHTML = '<div wd-target="testTarget"></div>';
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, parentElement);
    weld.bind(binder, function (el, targets) {
        expect(targets).toHaveProperty('testTarget');
    });

    weld.apply(rootEl);
});

test('multiple targets', function () {
    const binder = "testTargets";
    const expected = "here";
    const parentElement = createTestElement(binder, expected);
    parentElement.innerHTML = '<div wd-target="testTarget"></div><div wd-target="testTarget2"></div>';
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, parentElement);
    weld.bind(binder, function (el, attr, targets) {
        expect(attr).toBe(expected);
        expect(targets).toHaveProperty('testTarget');
        expect(targets).toHaveProperty('testTarget2');
    });
    weld.apply(rootEl);
});

test('should create element', function () {
    const el = weld.el('div');
    expect(el).toBeInstanceOf(HTMLDivElement);
});

test('should create element with text content', function () {
    const el = weld.el('div', 'here');
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.textContent).toBe('here');
});

test('should create element with text content from non-strings, non-objects', function () {
    const elInt = weld.el('div', 1);
    expect(elInt).toBeInstanceOf(HTMLDivElement);
    expect(elInt.textContent).toBe('1');

    const elFloat = weld.el('div', 1.1);
    expect(elFloat).toBeInstanceOf(HTMLDivElement);
    expect(elFloat.textContent).toBe('1.1');

    const elTrue = weld.el('div', true);
    expect(elTrue).toBeInstanceOf(HTMLDivElement);
    expect(elTrue.textContent).toBe('true');

    const elFalse = weld.el('div', false);
    expect(typeof false).toBe('boolean');
    expect(elFalse).toBeInstanceOf(HTMLDivElement);
    expect(elFalse.textContent).toBe('false');
});

test('should create element with id', function () {
    const el = weld.el('div#id');
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.id).toBe('id');
});

test('should create element with class', function () {
    const el = weld.el('div.class1');
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.classList.contains('class1')).toBe(true);
});

test('should create element with id and classes', function () {
    const el = weld.el('p#id.class1.class_2');
    expect(el).toBeInstanceOf(HTMLParagraphElement);
    expect(el.id).toBe('id');
    expect(el.classList.contains('class1')).toBe(true);
    expect(el.classList.contains('class_2')).toBe(true);
});

test('should create element with props', function () {
    const el = weld.el('div', 'hello', { class: 'class1' });
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.textContent).toBe('hello');
    expect(el.classList.contains('class1')).toBe(true);
});

// test('should create element with styles from prosp', function () {
//     const el = weld.el('div', 'hello', { style: 'background-color: red;' });
//     expect(el).toBeInstanceOf(HTMLDivElement);
//     expect(el.textContent).toBe('hello');
//     expect(el.classList.contains('class1')).toBe(true);
//     expect(el.style.backgroundColor).toBe('red');
// });

test('should create element with props including event listeners', function () {
    let n = 0;
    const mockFn = () => { n = 1; };
    const el = weld.el('div', 'hello', { onclick: mockFn });
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.innerHTML).toBe('hello');
    el.click();
    expect(n).toBe(1);
});

test('should absorb element and update props', function () {
    let n = 0;
    const mockFn = () => { n = 1; };
    const el = weld.el('div');
    weld.el(el, 'hello', { onclick: mockFn });
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.innerHTML).toBe('hello');
    el.click();
    expect(n).toBe(1);
});

test('should append single element', function () {
    const parentEl = weld.el('div');
    const el = weld.el('div');
    weld.dom.append(parentEl, el);
    expect(parentEl.children.length).toBe(1);
});

test('should append multiple elements', function () {
    const parentEl = weld.el('div');
    const el = weld.el('div');
    weld.dom.append(parentEl, [weld.el('div'), weld.el('div')]);
    expect(parentEl.children.length).toBe(2);
});

test('should replace element content with single element', function () {
    const parentEl = weld.el('div');
    weld.dom.append(parentEl, weld.el('div'));
    weld.dom.set(parentEl, weld.el('div'));
    expect(parentEl.children.length).toBe(1);
});

test('should replace element content with multiple elements', function () {
    const parentEl = weld.el('div');
    weld.dom.append(parentEl, weld.el('div'));
    weld.dom.set(parentEl, [weld.el('div'), weld.el('div')]);
    expect(parentEl.children.length).toBe(2);
});

test('should find elements', function () {
    const parentEl = weld.el('div');
    weld.dom.append(parentEl, weld.el('div.classfind'));
    weld.dom.append(parentEl, weld.el('div.classfind'));
    expect(weld.dom.find('.classfind', parentEl).length).toBe(2);
});

test('should get single element', function () {
    const parentEl = weld.el('div');
    weld.dom.append(parentEl, weld.el('div.classfind'));
    weld.dom.append(parentEl, weld.el('div.classfind'));
    expect(weld.dom.get('.classfind', parentEl)).toBeInstanceOf(HTMLDivElement);
});

test('applyBindings with no matching elements', () => {
    const rootEl = weld.el('div');
    weld.apply(rootEl); // Should not throw or fail
    expect(rootEl.children.length).toBe(0);
});

test('bind with duplicate binder names', () => {
    const binder = 'duplicateBinder';
    weld.bind(binder, () => { });
    weld.bind(binder, () => { throw new Error('Should not overwrite existing binder'); });
    expect(Object.keys(weld._binders).length).toBeGreaterThan(0);
});

test('parseDataAttr with invalid JSON', () => {
    const invalidJson = "{ name: 'weld', version: }";
    const result = weld.el('div', { 'wd-attr': invalidJson });
    expect(() => weld.apply(result)).not.toThrow();
});

test('createOrModifyElement with existing element', () => {
    const el = weld.el('div', 'original', { id: 'test' });
    weld.el(el, 'updated', { class: 'new-class' });
    expect(el.textContent).toBe('updated');
    expect(el.classList.contains('new-class')).toBe(true);
});

test('appendElements with null or undefined children', () => {
    const parentEl = weld.el('div');
    weld.dom.append(parentEl, [null, undefined, weld.el('div')]);
    expect(parentEl.children.length).toBe(1);
});

test('replaceElements with empty children', () => {
    const parentEl = weld.el('div');
    weld.dom.append(parentEl, weld.el('div'));
    weld.dom.set(parentEl, []);
    expect(parentEl.children.length).toBe(0);
});

test('createElementFromString with complex selectors', () => {
    const el = weld.el('div#id.class1.class2');
    expect(el.id).toBe('id');
    expect(el.classList.contains('class1')).toBe(true);
    expect(el.classList.contains('class2')).toBe(true);
});

test('apply with nested bindings', () => {
    const binder1 = 'parentBinder';
    const binder2 = 'childBinder';
    const parentEl = createTestElement(binder1);
    const childEl = createTestElement(binder2);
    weld.dom.append(parentEl, childEl);

    weld.bind(binder1, (el) => {
        expect(el).toBe(parentEl);
    });

    weld.bind(binder2, (el) => {
        expect(el).toBe(childEl);
    });

    weld.apply(parentEl);
});

test('weld.apply with wd-apply attribute', () => {
    const scriptEl = weld.el('script', { 'wd-apply': '' });
    document.body.appendChild(scriptEl);
    const binder = 'autoApplyBinder';
    weld.bind(binder, (el) => {
        expect(el).toBeInstanceOf(HTMLElement);
    });
    weld.apply();
    document.body.removeChild(scriptEl);
});

test('weld.dom.find with no matches', () => {
    const parentEl = weld.el('div');
    const result = weld.dom.find('.nonexistent', parentEl);
    expect(result.length).toBe(0);
});

test('weld.dom.get with no matches', () => {
    const parentEl = weld.el('div');
    const result = weld.dom.get('.nonexistent', parentEl);
    expect(result).toBeNull();
});

test('weld.el with event listeners', () => {
    let clicked = false;
    const el = weld.el('button', 'Click me', { onclick: () => { clicked = true; } });
    el.click();
    expect(clicked).toBe(true);
});

test('weld.bind with missing binder', () => {
    const rootEl = weld.el('div');
    weld.dom.append(rootEl, createTestElement('nonExistentBinder'));
    expect(() => weld.apply(rootEl)).not.toThrow();
});

test('AMD and CommonJS compatibility', () => {
    expect(typeof weld).toBe('object');
    expect(typeof weld.apply).toBe('function');
});

test('weld._binders updates correctly', () => {
    const binder = 'testBinder';
    weld.bind(binder, () => { });
    expect(weld._binders).toHaveProperty(binder);
});

test('should create element with a single style property', () => {
    const el = weld.el('div', { style: 'color: red;' });
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.style.color).toBe('red');
});

test('should create element with multiple style properties', () => {
    const el = weld.el('div', { style: 'color: red; background-color: blue;' });
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.style.color).toBe('red');
    expect(el.style.backgroundColor).toBe('blue');
});

test('should create element with hyphenated style properties', () => {
    const el = weld.el('div', { style: 'font-size: 16px; line-height: 1.5;' });
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.style.fontSize).toBe('16px');
    expect(el.style.lineHeight).toBe('1.5');
});

test('should create element with numeric style values', () => {
    const el = weld.el('div', { style: 'width: 100px; height: 200px;' });
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('200px');
});

test('should update styles dynamically', () => {
    const el = weld.el('div', { style: 'color: red;' });
    weld.el(el, { style: 'color: blue;' });
    expect(el.style.color).toBe('blue');
});

test('should remove styles when style is an empty string', () => {
    const el = weld.el('div', { style: 'color: red;' });
    expect(el.style.color).toBe('red');
    weld.el(el, { style: '' });
    expect(el.style.color).toBe('');
});
