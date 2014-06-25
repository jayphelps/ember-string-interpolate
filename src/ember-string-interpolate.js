/**
 * Ember.String.interpolate v2.0
 * (c) 2014 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/ember-string-interpolate
 * @license
 */
(function (Ember) {
  if (Ember === undefined) throw new Error('Ember.js must be loaded before Ember.String.interpolate');

  var ENV = window.ENV || {},
      getPropertyKeys = InterpolatedString.getPropertyKeys;

  var emberStringInterpolate = Ember.String.interpolate = function (str, context) {
    return (new InterpolatedString(str, context)).toString();
  };

  var emberComputedInterpolate = Ember.computed.interpolate = function (str) {
    var ret = Ember.computed(function () {
      return emberStringInterpolate(str, this);
    });

    return ret.property.apply(ret, getPropertyKeys(str));
  };

  // Honor the Ember convention for extending native prototypes
  if (ENV.EXTEND_PROTOTYPES || Ember.EXTEND_PROTOTYPES) {
    String.prototype.interpolate = function () {
      return emberComputedInterpolate(this);
    };
  }

})(this.Ember);