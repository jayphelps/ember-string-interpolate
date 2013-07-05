/**
 * Ember.String.interpolate
 * (c) 2013 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/ember-string-interpolate
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