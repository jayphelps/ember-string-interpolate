/**
 * Ember.String.interpolate
 * (c) 2013 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/ember-string-interpolate
 */
(function (Ember) {

    var identiferRegExp = /([$A-Z_][0-9A-Z_$]*(?:\.[$A-Z_][0-9A-Z_$]*)*)/gi;
    var getterRegExp = new RegExp('\\$' + identiferRegExp.source, 'gi');
    var expressionRegExp = /\${([^}]+)}/gi;
    var notCallRegExp = /\b(?!\()/;
    var variableRegExp = new RegExp('\(' + identiferRegExp.source + notCallRegExp.source + '\)', 'gi');

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

    function isSet(value) {
        return (value !== undefined && value !== null);
    }

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
    };

    function getPropertyKeys(str) {
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

            if (!isSet(value)) {
                value = (polatedKey === key) ? match : '$' + polatedKey;
            }

            return value.toString();
        });
    }

    function InterpolatedString(template, context) {
        this.template = template;
        this.context = context;
    }

    InterpolatedString.prototype.toString = function () {
        return this.interpolate(this.template, this.context);
    };

    InterpolatedString.prototype.interpolate = function (str, context) {
        str = interpolateExpressions(str, context);
        str = interpolateGetters(str, context);
        return str;
    };
        
    function interpolate(context) {
        var ret, str = this;

        if (!context || !context.get) {
            ret = Ember.computed(function () {
                return interpolate.call(str, this);
            });

            console.log('KEYS', getPropertyKeys(str));
            ret = ret.property.apply(ret, getPropertyKeys(str));
        } else {
            ret = new InterpolatedString(this, context);
        }

        console.log('prop',ret)
        return ret;
    }

    var nativeEmberString = Ember.String,
        EmberStringProto;

    function EmberString(str) {
        if (this instanceof EmberString) {
            String.call(this, str);
            this._value = str;
        } else {
            return new EmberString(str);
        }
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
 
    var ENV = window.ENV || {};

    // Honor the Ember convention for extending native prototypes
    if (ENV.EXTEND_PROTOTYPES || Ember.EXTEND_PROTOTYPES) {
        String.prototype.interpolate = interpolate;
    }

})(Ember);