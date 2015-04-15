define('app/initializers/ember-moment', ['exports', 'ember-moment/helpers/moment', 'ember-moment/helpers/ago', 'ember-moment/helpers/duration', 'ember'], function (exports, moment, ago, duration, Ember) {

  'use strict';

  var initialize = function initialize() {
    var registerHelper;

    if (Ember['default'].HTMLBars) {
      registerHelper = function (helperName, fn) {
        Ember['default'].HTMLBars._registerHelper(helperName, Ember['default'].HTMLBars.makeBoundHelper(fn));
      };
    } else {
      registerHelper = Ember['default'].Handlebars.helper;
    };

    registerHelper("moment", moment['default']);
    registerHelper("ago", ago['default']);
    registerHelper("duration", duration['default']);
  };

  exports['default'] = {
    name: "ember-moment",

    initialize: initialize
  };
  /* container, app */

  exports.initialize = initialize;

});