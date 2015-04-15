define('ember-moment/computed', ['exports', 'ember-moment/computeds/moment', 'ember-moment/computeds/ago', 'ember-moment/computeds/duration'], function (exports, moment, ago, duration) {

  'use strict';

  Object.defineProperty(exports, 'moment', { enumerable: true, get: function () { return moment['default']; }});
  Object.defineProperty(exports, 'ago', { enumerable: true, get: function () { return ago['default']; }});
  Object.defineProperty(exports, 'duration', { enumerable: true, get: function () { return duration['default']; }});

});