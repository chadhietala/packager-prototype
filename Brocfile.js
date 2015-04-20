/* global require, module */

// LULZ need to remove about of this
var stew = require('broccoli-stew');
var ES6Modules = require('broccoli-es6modules');
var es6Transpiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var fs = require('fs-extra');
var find = stew.find;
var rename = stew.rename;
var PrePackager = require('ember-cli-pre-packager');
var ember = 'node_modules/ember';

fs.mkdirsSync('./node_modules/ember/addon');
fs.mkdirsSync('./node_modules/ember/app');
fs.copySync('./bower_components/ember/ember.debug.js', './' + ember + '/addon/ember.js');
fs.writeJsonSync('./' + ember + '/package.json', {
  name: 'ember',
  main: 'addon/ember.js'
});
fs.writeJsonSync('./' + ember + '/addon/dep-graph.json', {
  "ember.js": {
    "imports": [],
    "exports": ["NOT IMPLEMENTED YET"]
  }
});

var app = 'app';
app = find(app, '**/*.{js,json}');

var deps = ['ember-moment', 'ember'];

var addonAppFolders = deps.map(function(depName) {
  return rename(find('node_modules/' + depName, 'app/**/*.js'), function(relativePath) {
    return relativePath.replace('node_modules/' + depName + '/app', 'app');
  });
});

var addonFolders = deps.map(function(depName) {
  return new ES6Modules(rename(find('node_modules/' + depName, 'addon/**/*.js'), function (relativePath) {
    return relativePath.replace('node_modules/' + depName + '/addon', depName);
  }), {
    esperantoOptions: {
      absolutePaths: true,
      strict: true
    }
  });
});

// capture json

app = es6Transpiler(find(addonAppFolders.concat(app)), {
  blacklist: ['useStrict', 'es6.modules']
});

app = rename(app, 'app/', 'packager-proto/');

app = new ES6Modules(app, {
  esperantoOptions: {
    absolutePaths: true,
    strict: true
  }
});

var bundle = mergeTrees(addonFolders.concat([app]));

app = new PrePackager(bundle, {
  entries: ['packager-proto']
});

module.exports = app;
