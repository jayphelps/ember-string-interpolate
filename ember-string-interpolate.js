
/**
 * String.interpolate.js
 * (c) 2013 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/string.interpolate.js
 */
(function () {
    'use strict';

    var identifierSymbol, identiferRegExp, getterRegExp, expressionRegExp,
        notCallRegExp, variableRegExp;

    if (!this.ENV || this.ENV.EXTEND_PROTOTYPES !== false) {
        String.prototype.interpolate = function (context) {
            return new InterpolatedString(this, context);
        };
    }

    // Allows people to override some of the options, like which symbol
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

    InterpolatedString.setup();

    var ArrayProto = Array.prototype,
        nativeIndexOf = ArrayProto.indexOf;

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

    function isSet(value) {
        return (value !== undefined && value !== null);
    }

    function get(context, key) {
        var parts, value;

        if (context.get) {
            value = context.get(key);
        } else {
            parts = key.split('.');
            while (key = parts.shift()) {
                context = context[key];
            }

            value = context;
        }

        return value;
    }

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

            if (!isSet(value)) {
                value = (polatedKey === key) ? match : identifierSymbol + polatedKey;
            }

            return value.toString();
        });
    }

    function InterpolatedString(str, context) {
        str = str || '';
        context = context || {};

        var isConstructed = (this instanceof InterpolatedString);
        // Force construction if they're missing `new`
        if (!isConstructed) return new InterpolatedString(str, context);

        String.call(this, str);

        str = interpolateExpressions(str, context);
        str = interpolateGetters(str, context);

        this._value = str;
    }

    // Export constructor
    this.InterpolatedString = InterpolatedString;

    InterpolatedString.prototype = new String();
    var InterpolatedStringPrototype = InterpolatedString.prototype;
    InterpolatedStringPrototype.constructor = InterpolatedString;

    InterpolatedStringPrototype.toString = InterpolatedStringPrototype.valueOf = function () {
        return this._value;
    };

}).call(this);

/**
 * Ember.String.interpolate
 * (c) 2013 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/ember-string-interpolate
 * @license
 */
(function (Ember) {
    if (Ember === undefined) throw new Error('Ember.js must be loaded before Ember.String.interpolate');
    
    var ENV = window.ENV || {},
        getPropertyKeys = InterpolatedString.getPropertyKeys;

    function interpolate(context) {
        var ret, str = this;

        if (!context || !context.get) {
            ret = Ember.computed(function () {
                return interpolate.call(str, this);
            });

            ret = ret.property.apply(ret, getPropertyKeys(str));
        } else {
            ret = new InterpolatedString(this, context);
        }

        return ret;
    }

    // Honor the Ember convention for extending native prototypes
    if (ENV.EXTEND_PROTOTYPES || Ember.EXTEND_PROTOTYPES) {
        String.prototype.interpolate = interpolate;
    }

    var nativeEmberString = Ember.String,
        EmberStringProto;

    function EmberString(str) {
        var isConstructed = (this instanceof EmberString);
        // Force construction if they're missing `new`
        if (!isConstructed) return new EmberString(str);

        String.call(this, str);
        this._value = str;
    }

    EmberString.prototype = new String();
    EmberStringProto = EmberString.prototype;
    
    EmberStringProto.constructor = EmberString;
    EmberStringProto.interpolate = interpolate;

    EmberStringProto.toString = EmberStringProto.valueOf = function () {
        return this._value;
    };

    Ember.mixin(EmberStringProto, nativeEmberString);
    Ember.mixin(EmberString, nativeEmberString);

    Ember.String = EmberString;

})(Ember);
