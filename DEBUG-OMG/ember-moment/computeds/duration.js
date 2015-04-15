define('ember-moment/computeds/duration', ['exports', 'ember', 'moment', 'ember-moment/computeds/moment'], function (exports, Ember, moment, ___moment) {

  'use strict';

  var get = Ember['default'].get;
  var emberComputed = Ember['default'].computed;

  function computedDuration(val, maybeUnits) {
    var numArgs = arguments.length;
    var args = [val];

    var computed = emberComputed(val, function () {
      var momentArgs, desc, input;
      
      momentArgs = [get(this, val)];

      if (numArgs > 1) {
        desc = ___moment.descriptorFor.call(this, maybeUnits);
        input = desc ? get(this, maybeUnits) : maybeUnits;

        if (desc && computed._dependentKeys.indexOf(maybeUnits) === -1) {
          computed.property(maybeUnits);
        }

        momentArgs.push(input);
      }

      return moment['default'].duration.apply(this, momentArgs).humanize();
    });

    return computed.property.apply(computed, args).readOnly();
  }
  exports['default'] = computedDuration;

});