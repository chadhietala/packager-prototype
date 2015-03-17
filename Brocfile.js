/* global require, module */

var stew = require('broccoli-stew');
var concat = require('broccoli-sourcemap-concat');
var ES6Modules = require('broccoli-es6modules');
var es6Transpiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var find = stew.find;
var mv = stew.mv;
var log = stew.log;
var rename = stew.rename;

var app = 'app';
app = find(app, '**/*.js');

app = new ES6Modules(app, {
  esperantoOptions: {
    absolutePaths: true,
    strict: true
  }
});

var moment = 'node_modules/ember-moment';
var momentApp = rename(find(moment, 'app/**/*.js'), function(relativePath) {
  return relativePath.replace('node_modules/ember-moment/app', 'app');
});
var momentAddon = rename(find(moment, 'addon/**/*.js'), function(relativePath) {
  return relativePath.replace('node_modules/ember-moment/addon', 'ember-moment');
});

app = es6Transpiler(app, {
  blacklist: ['useStrict', 'es6.modules']
});



app = mergeTrees([app, momentApp], {overwrite: true});
app = mergeTrees([app, momentAddon]);
app = log(app);

// app = concat(app, {
//   inputFiles: ['**/*.js'],
//   outputFile: '/~packager-proto/app.js'
// });


module.exports = app;
