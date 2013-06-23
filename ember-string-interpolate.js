/**
 * Ember.String.interpolate
 * (c) 2013 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/ember-string-interpolate
 */
(function (Ember) {

    function get(context, key) {
        if (context.get) {
            return context.get(key);
        } else {
            return context[key];
        }
    }

    function isSet(value) {
        return (value !== undefined && value !== null);
    }

    function getPropertyKeys(str) {
        var match, inner,
            keys = [],
            inlineRegex = /\$+([A-Z_][0-9A-Z_]*)/gi,
            expressionRegex = /\${([^}]+)}/ig;

        while (match = inlineRegex.exec(str)) {
            keys.push(match[1]);
        }

        while (match = expressionRegex.exec(str)) {
            inner = match[1].match(/([A-Z0-9]+\b(?!\())/gi);
            keys.push.apply(keys, inner);
        }

        return keys;
    }

    function interpolateExpressions(str, context) {
        return str.replace(/\${([^}]+)}/gi, function (match, expression) {
            var args = [],
                values = [];

            expression = expression.replace(/([A-Z0-9]+\b(?!\())/gi, function (match, key) {
                var value = get(context, key);
                
                if (isSet(value)) {
                    args.push(key);
                    values.push(value.toString());
                }
                
                return key;
            });

            args.push('return ' + expression);
            return Function.apply(Function, args).apply(context, values);
        });
    }

    function interpolateGetters(str, context) {
        return str.replace(/\$(\$*[A-Z_][0-9A-Z_]*)/gi, function (match, key) {
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

            ret = ret.property.apply(ret, getPropertyKeys(str));
        } else {
            ret = new InterpolatedString(this, context);
        }

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