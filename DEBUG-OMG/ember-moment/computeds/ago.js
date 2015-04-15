define('ember-moment/computeds/ago', ['exports', 'ember', 'moment', 'ember-moment/computeds/moment'], function (exports, Ember, moment, ___moment) {

  'use strict';

  var get = Ember['default'].get;
  var emberComputed = Ember['default'].computed;

  function computedAgo(date, maybeInputFormat) {
    var args = [date];
    
    var computed = emberComputed(date, function () {
      var momentArgs, desc, input;
      momentArgs = [get(this, date)];

      if (arguments.length > 1) {
        desc = ___moment.descriptorFor.call(this, maybeInputFormat);
        input = desc ? get(this, maybeInputFormat) : maybeInputFormat;

        if (desc && computed._dependentKeys.indexOf(maybeInputFormat) === -1) {
          computed.property(maybeInputFormat);
        }

        momentArgs.push(input);
      }

      return moment['default'].apply(this, momentArgs).fromNow();
    });

    return computed.property.apply(computed, args).readOnly();
  }
  exports['default'] = computedAgo;

});