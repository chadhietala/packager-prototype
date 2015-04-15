define('ember-moment/helpers/ago', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  var ago;

  if (Ember['default'].HTMLBars) {
    ago = function ago(params) {
      if (params.length === 0) {
        throw new TypeError('Invalid Number of arguments, expected at least 1');
      }

      return moment['default'].apply(this, params).fromNow();
    };
  } else {
    ago = function ago(value, maybeInput) {
      var length = arguments.length;
      var args = [value];

      if (length === 1) {
        throw new TypeError('Invalid Number of arguments, expected at least 1');
      } else if (length > 3) {
        args.push(maybeInput);
      }

      return moment['default'].apply(this, args).fromNow();
    };
  }

  exports['default'] = ago;

});