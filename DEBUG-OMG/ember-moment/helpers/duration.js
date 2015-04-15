define('ember-moment/helpers/duration', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  var duration;

  if (Ember['default'].HTMLBars) {
    duration = function duration(params) {
      var length = params.length;

      if (length === 0 || length > 2) {
        throw new TypeError('Invalid Number of arguments, expected 1 or 2');
      }

      return moment['default'].duration.apply(this, params).humanize();
    };
  } else {
    duration = function duration(arg1, arg2) {
      var length = arguments.length;

      if (length === 1 || length > 3) {
        // there's one extra argument that handlebars adds to the end,
        // which explains the difference in what we are checking and the error we are raising
        throw new TypeError('Invalid Number of arguments, expected 1 or 2');
      }

      var args = [arg1];

      if (length === 3) {
        args.push(arg2);
      }

      return moment['default'].duration.apply(this, args).humanize();
    };
  }

  exports['default'] = duration;

});