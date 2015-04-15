define('app/app', ['exports', 'ember', 'app/config/environment'], function (exports, Ember, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver
  });

  loadInitializers(App, config['default'].modulePrefix);

  exports['default'] = App;

});