const doc = document;
const win = window;
const docEle = doc.documentElement;
const createElement = doc.createElement.bind(doc);
const div = createElement('div');
const table = createElement('table');
const tbody = createElement('tbody');
const tr = createElement('tr');
const { isArray, prototype: ArrayPrototype } = Array;
const { concat, filter, indexOf, map, push, slice, some, splice } = ArrayPrototype;
const idRe = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/;
const classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/;
const htmlRe = /<.+>/;
const tagRe = /^\w+$/;
// @require ./variables.ts
function find(selector, context) {
    const isFragment = isDocumentFragment(context);
    return !selector || (!isFragment && !isDocument(context) && !isElement(context))
        ? []
        : !isFragment && classRe.test(selector)
            ? context.getElementsByClassName(selector.slice(1).replace(/\\/g, ''))
            : !isFragment && tagRe.test(selector)
                ? context.getElementsByTagName(selector)
                : context.querySelectorAll(selector);
}
// @require ./find.ts
// @require ./variables.ts
class Cash {
    constructor(selector, context) {
        if (!selector)
            return;
        if (isCash(selector))
            return selector;
        let eles = selector;
        if (isString(selector)) {
            const ctx = context || doc;
            eles = idRe.test(selector) && isDocument(ctx)
                ? ctx.getElementById(selector.slice(1).replace(/\\/g, ''))
                : htmlRe.test(selector)
                    ? parseHTML(selector)
                    : isCash(ctx)
                        ? ctx.find(selector)
                        : isString(ctx)
                            ? cash(ctx).find(selector)
                            : find(selector, ctx);
            if (!eles)
                return;
        }
        else if (isFunction(selector)) {
            return this.ready(selector); //FIXME: `fn.ready` is not included in `core`, but it's actually a core functionality
        }
        if (eles.nodeType || eles === win)
            eles = [eles];
        this.length = eles.length;
        for (let i = 0, l = this.length; i < l; i++) {
            this[i] = eles[i];
        }
    }
    init(selector, context) {
        return new Cash(selector, context);
    }
}
const fn = Cash.prototype;
const cash = fn.init;
cash.fn = cash.prototype = fn; // Ensuring that `cash () instanceof cash`
fn.length = 0;
fn.splice = splice; // Ensuring a cash collection gets printed as array-like in Chrome's devtools
if (typeof Symbol === 'function') { // Ensuring a cash collection is iterable
    fn[Symbol['iterator']] = ArrayPrototype[Symbol['iterator']];
}
function isCash(value) {
    return value instanceof Cash;
}
function isWindow(value) {
    return !!value && value === value.window;
}
function isDocument(value) {
    return !!value && value.nodeType === 9;
}
function isDocumentFragment(value) {
    return !!value && value.nodeType === 11;
}
function isElement(value) {
    return !!value && value.nodeType === 1;
}
function isText(value) {
    return !!value && value.nodeType === 3;
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isFunction(value) {
    return typeof value === 'function';
}
function isString(value) {
    return typeof value === 'string';
}
function isUndefined(value) {
    return value === undefined;
}
function isNull(value) {
    return value === null;
}
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
function isPlainObject(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
}
cash.isWindow = isWindow;
cash.isFunction = isFunction;
cash.isArray = isArray;
cash.isNumeric = isNumeric;
cash.isPlainObject = isPlainObject;
function each(arr, callback, _reverse) {
    if (_reverse) {
        let i = arr.length;
        while (i--) {
            if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
        }
    }
    else if (isPlainObject(arr)) {
        const keys = Object.keys(arr);
        for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];
            if (callback.call(arr[key], key, arr[key]) === false)
                return arr;
        }
    }
    else {
        for (let i = 0, l = arr.length; i < l; i++) {
            if (callback.call(arr[i], i, arr[i]) === false)
                return arr;
        }
    }
    return arr;
}
cash.each = each;
fn.each = function (callback) {
    return each(this, callback);
};
// @require ./type_checking.ts
const splitValuesRe = /\S+/g;
function getSplitValues(str) {
    return isString(str) ? str.match(splitValuesRe) || [] : [];
}
fn.removeAttr = function (attr) {
    const attrs = getSplitValues(attr);
    return this.each((i, ele) => {
        if (!isElement(ele))
            return;
        each(attrs, (i, a) => {
            ele.removeAttribute(a);
        });
    });
};
function attr(attr, value) {
    if (!attr)
        return;
    if (isString(attr)) {
        if (arguments.length < 2) {
            if (!this[0] || !isElement(this[0]))
                return;
            const value = this[0].getAttribute(attr);
            return isNull(value) ? undefined : value;
        }
        if (isUndefined(value))
            return this;
        if (isNull(value))
            return this.removeAttr(attr);
        return this.each((i, ele) => {
            if (!isElement(ele))
                return;
            ele.setAttribute(attr, value);
        });
    }
    for (const key in attr) {
        this.attr(key, attr[key]);
    }
    return this;
}
fn.attr = attr;
fn.get = function (index) {
    if (isUndefined(index))
        return slice.call(this);
    index = Number(index);
    return this[index < 0 ? index + this.length : index];
};
function text(text) {
    if (isUndefined(text)) {
        return this.get().map(ele => isElement(ele) || isText(ele) ? ele.textContent : '').join('');
    }
    return this.each((i, ele) => {
        if (!isElement(ele))
            return;
        ele.textContent = text;
    });
}
fn.text = text;
// @require ./cash.ts
function matches(ele, selector) {
    const matches = ele && (ele['matches'] || ele['webkitMatchesSelector'] || ele['msMatchesSelector']);
    return !!matches && !!selector && matches.call(ele, selector);
}
// @require ./matches.ts
// @require ./type_checking.ts
function getCompareFunction(comparator) {
    return isString(comparator)
        ? (i, ele) => matches(ele, comparator)
        : isFunction(comparator)
            ? comparator
            : isCash(comparator)
                ? (i, ele) => comparator.is(ele)
                : !comparator
                    ? () => false
                    : (i, ele) => ele === comparator;
}
fn.filter = function (comparator) {
    const compare = getCompareFunction(comparator);
    return cash(filter.call(this, (ele, i) => compare.call(ele, i, ele)));
};
// @require collection/filter.ts
function filtered(collection, comparator) {
    return !comparator ? collection : collection.filter(comparator);
}
fn.is = function (comparator) {
    const compare = getCompareFunction(comparator);
    return some.call(this, (ele, i) => compare.call(ele, i, ele));
};
function pluck(arr, prop, deep, until) {
    const plucked = [];
    const isCallback = isFunction(prop);
    const compare = until && getCompareFunction(until);
    for (let i = 0, l = arr.length; i < l; i++) {
        if (isCallback) {
            const val = prop(arr[i]);
            if (val.length)
                push.apply(plucked, val);
        }
        else {
            let val = arr[i][prop];
            while (val != null) {
                if (until && compare(-1, val))
                    break;
                plucked.push(val);
                val = deep ? val[prop] : null;
            }
        }
    }
    return plucked;
}
function unique(arr) {
    return arr.length > 1 ? filter.call(arr, (item, index, self) => indexOf.call(self, item) === index) : arr;
}
cash.unique = unique;
fn.parent = function (comparator) {
    return filtered(cash(unique(pluck(this, 'parentNode'))), comparator);
};
fn.closest = function (comparator) {
    const filtered = this.filter(comparator);
    if (filtered.length)
        return filtered;
    const $parent = this.parent();
    if (!$parent.length)
        return filtered;
    return $parent.closest(comparator);
};
fn.find = function (selector) {
    return cash(unique(pluck(this, ele => find(selector, ele))));
};
// @require attributes/attr.ts
// @require manipulation/text.ts
// @require traversal/closest.ts
// @require traversal/find.ts
// @require methods.ts
export default cash;
export { Cash, Ele as Element, Selector, Comparator, Context };
