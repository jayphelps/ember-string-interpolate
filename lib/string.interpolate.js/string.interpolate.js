/**
 * String.interpolate.js v2.0
 * (c) 2014 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/string.interpolate.js
 * @license
 */
(function (root) {
    'use strict';

    var ArrayProto = Array.prototype,
        nativeIndexOf = ArrayProto.indexOf;

    // Shim for older browsers
    function indexOf(array, item) {
        // If true, they didn't pass a useful array-like object.
        if (array == null || array.length === undefined) return -1;

        if (nativeIndexOf && array.indexOf === nativeIndexOf) {
            return array.indexOf(item);
        }

        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i] === item) return i;
        }

        // Exhausted all routes, it's not in there.
        return -1;
    }

    // We'll use this to consider a property "set" or not. Note that null
    // is not considered set to us, so it'll be replaced with an empty value
    function isSet(value) {
        return (value !== undefined && value !== null);
    }

    // Given a context object, look up a property based on a key path.
    // e.g. get(obj, 'first.second.third');
    // It will also fallback to the global, root object (window usually) if it
    // doesn't find anything in the given context
    function get(originalContext, originalKey) {
        var key = originalKey,
            context = originalContext,
            parts, value;

        if (context.get) {
            value = context.get(key);
        } else {
            parts = key.split('.');

            while (key = parts.shift()) {
                context = context[key];
            }

            value = context;
        }

        // If no set value was found, try global
        if (originalContext !== root && !isSet(value)) {
            value = get(root, originalKey);
        }

        return value;
    }

    function interpolateExpressions(str, context) {
        return str.replace(expressionRegExp, function (match, expression) {
            var args = [],
                values = [];

            expression = expression.replace(variableRegExp, function (match, key) {
                var value = get(context, key),
                    keys = key.split('.'),
                    lastKey = keys[keys.length-1];

                if (isSet(value)) {
                    args.push(lastKey);
                    values.push(value);
                }
                
                return lastKey;
            });

            args.push('return ' + expression);

            return Function.apply(Function, args).apply(context, values);
        });
    }

    function interpolateGetters(str, context) {
        return str.replace(getterRegExp, function (match, key) {
            var polatedKey = interpolateGetters(key, context),
                value = get(context, polatedKey);

            // Replace with an empty string if value is not set (undefined/null)
            return (isSet(value)) ? value.toString() : '';
        });
    }

    // Add prototype extension, unless they told us not to
    if (!root.InterpolatedString || root.InterpolatedString.EXTEND_PROTOTYPES !== false) {
        String.prototype.interpolate = function (context) {
            return new InterpolatedString(this, context);
        };
    }

    function InterpolatedString(str, context) {
        str = str || '';
        context = context || {};

        var isConstructed = (this instanceof InterpolatedString);
        // Force construction if they're missing `new`
        if (!isConstructed) return new InterpolatedString(str, context);

        str = interpolateExpressions(str, context);
        str = interpolateGetters(str, context);

        this._value = str;
    }

    // We can't actually inheirt all of the behavior of String's...but we can
    // at least try.
    InterpolatedString.prototype = new String();
    // Keep our constructor!
    InterpolatedString.prototype.constructor = InterpolatedString;

    // Return the primitive interpolated string
    InterpolatedString.prototype.toString = InterpolatedString.prototype.valueOf = function () {
        return this._value;
    };

    // These are initialized in InterpolatedString.setup() and used only in
    // this scope
    var identifierSymbol, identiferRegExp, getterRegExp, expressionRegExp,
        notCallRegExp, variableRegExp;

    // Allow people to override some of the options, like which symbol
    // identifies an identifier or expression start
    InterpolatedString.setup = function (options) {
        options = options || {};

        identifierSymbol = options.identifierSymbol || '$',
        identiferRegExp = options.identiferRegExp || /([$A-Z_][0-9A-Z_$]*(?:\.[$A-Z_][0-9A-Z_$]*)*)/gi,
        getterRegExp = new RegExp('\\' + identifierSymbol + identiferRegExp.source, 'gi'),
        expressionRegExp = new RegExp('\\' + identifierSymbol + (/{([^}]+)}/).source, 'gi'),
        notCallRegExp = /\b(?!\()/,
        variableRegExp = new RegExp('\(' + identiferRegExp.source + notCallRegExp.source + '\)', 'gi');
    };

    // Set the defaults
    InterpolatedString.setup();

    InterpolatedString.getPropertyKeys = function (str) {
        var i, l, match, inner,
            keys = [];

        while (match = getterRegExp.exec(str)) {
            // Get rid of variable variable dollar signs since we can't include
            // them as keys as they can change
            match = match[1].replace(/^\$*/, '');
            if (indexOf(keys, match) === -1) {
                keys.push(match);
            }
        }

        while (match = expressionRegExp.exec(str)) {
            inner = match[1].match(variableRegExp);
            for (i = 0, l = inner.length; i < l; i++) {
                if (indexOf(keys, inner[i]) === -1) {
                    keys.push(inner[i]);
                }
            }
        }

        return keys;
    };

    // Just in case they're curious
    InterpolatedString.VERSION = '2.0';

    if (typeof exports !== 'undefined') {
        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = InterpolatedString;
        }

        exports.InterpolatedString = InterpolatedString;
    } else {
        // Browser/others
        root.InterpolatedString = InterpolatedString;
    }

}).call(this, this);