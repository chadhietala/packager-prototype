define('ember-moment/computeds/moment', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  exports.descriptorFor = descriptorFor;

  var get = Ember['default'].get;
  var emberComputed = Ember['default'].computed;
  var EnumerableUtils = Ember['default'].EnumerableUtils;
  var a_slice = Array.prototype.slice;

  function descriptorFor(propertyName) {
    var meta = Ember['default'].meta(this);

    if (meta && meta.descs) {
      return meta.descs[propertyName];
    }
  }

  function computedMoment(date, outputFormat, maybeInputFormat) {
    Ember['default'].assert('More than one argument passed into moment computed', arguments.length > 1);

    var args = a_slice.call(arguments);
    var computed;

    args.shift();

    return computed = emberComputed(date, function () {
      var desc,
          self = this,
          momentArgs = [get(this, date)];

      var propertyValues = EnumerableUtils.map(args, function (arg) {
        desc = descriptorFor.call(self, arg);

        if (desc && computed._dependentKeys.indexOf(arg) === -1) {
          computed.property(arg);
        }

        return desc ? get(self, arg) : arg;
      });

      outputFormat = propertyValues[0];

      if (propertyValues.length > 1) {
        maybeInputFormat = propertyValues[1];
        momentArgs.push(maybeInputFormat);
      }

      return moment['default'].apply(this, momentArgs).format(outputFormat);
    }).readOnly();
  }
  exports['default'] = computedMoment;

});