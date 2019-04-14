'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}
Rectangle.prototype.getArea = function() {
    return this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    let obj = JSON.parse(json);
    let resultObject = Object.create(proto);
    return Object.assign(resultObject, obj);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {

    element: function(value) {
        return new Selector('element', value);
    },

    id: function(value) {
        return new Selector('id', value);
    },

    class: function(value) {
        return new Selector('className', value);
    },

    attr: function(value) {
        return new Selector('attribute', value);
    },

    pseudoClass: function(value) {
        return new Selector('pseudoClass', value);
    },

    pseudoElement: function(value) {
        return new Selector('pseudoElement', value);
    },

    combine: function(selector1, combinator, selector2) {
        return new CombineSelector(selector1, combinator, selector2);
    },
};

function CombineSelector(selector1, combinator, selector2) {
    this.selector1 = selector1;
    this.combinator = combinator;
    this.selector2 = selector2;
}

CombineSelector.prototype.stringify = function() {
    return `${this.selector1.stringify()} ${this.combinator} ${this.selector2.stringify()}`;
}

function Selector(type, value) {
    this.cache = {
        element: '',
        id: '',
        className: [],
        attribute: [],
        pseudoClass: [],
        pseudoElement: '',
    };
    if (Array.isArray(this.cache[type])) {
        this.cache[type] = [value];
    } else {
        this.cache[type] = value;
    }
}

Selector.prototype.stringify = function() {
    let result = this.cache.element;
    if(this.cache.id) {
        result += `#${this.cache.id}`;
    }
    result += this.cache.className.map(className=>`.${className}`).join('');
    result += this.cache.attribute.map(attribute=>`[${attribute}]`).join('');
    result += this.cache.pseudoClass.map(pseudoClass=>`:${pseudoClass}`).join('');
    if(this.cache.pseudoElement) {
        result += `::${this.cache.pseudoElement}`;
    }

    return result;
}

Selector.prototype.element = function() {
    if (this.cache.element) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
}

Selector.prototype.id = function(value) {
    if (this.cache.id) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (this.cache.className.length || this.cache.attribute.length || this.cache.pseudoClass.length || this.cache.pseudoElement) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.cache.id = value;
    return this;
}
Selector.prototype.class = function(value) {
    if (this.cache.attribute.length || this.cache.pseudoClass.length || this.cache.pseudoElement) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.cache.className.push(value);
    return this;
}

Selector.prototype.attr = function(value) {
    if (this.cache.pseudoClass.length || this.cache.pseudoElement) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.cache.attribute.push(value);
    return this;
}

Selector.prototype.pseudoClass = function(value) {
    if (this.cache.pseudoElement) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.cache.pseudoClass.push(value);
    return this;
}

Selector.prototype.pseudoElement = function(value) {
    if(this.cache.pseudoElement) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.cache.pseudoElement = value;
    return this;
}


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
