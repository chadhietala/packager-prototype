/* global require, module */

var stew = require('broccoli-stew');
var concat = require('broccoli-sourcemap-concat');
var ES6Modules = require('broccoli-es6modules');
var es6Transpiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var CachingWriter = require('broccoli-caching-writer');
var CoreObject = require('core-object');
var walkSync = require('walk-sync');
var Funnel = require('broccoli-funnel');
var fs = require('fs-extra');
var path = require('path');
var find = stew.find;
var mv = stew.mv;
var log = stew.log;
var rm = stew.rm;
var rename = stew.rename;





var AllDependencyGraphs = CoreObject.extend({});

var DependencyGraph = CoreObject.extend({
  init: function(inputTree, options) {
    this.inputTree = inputTree;
    this.options = options;   
    this.allDependencies = this.options.allDependencies;
  },
  read: function(readTree) {
    return readTree(this.inputTree).then(function(srcDir) {
      var depGraph = walkSync(srcDir).filter(function(path) {
        return path === '/dep-graph.json'; 
      })[0];
      var depGraphJson = fs.readJSONSync(path.join(srcDir, depGraph));
      console.log(depGraphJson);
      return '/';
    });
  },
  cleanup: function() {},
  update: function() {},
  for: function(name) {
  }
});

var ALL_DEPENDENCIES = {
  allDependencies: [],
  for: function(dep) {

  }
};

function syncForwardDepedencies(destination, dep, dependencies) {

}

function resolve(destination, dep) {
  return syncForwardDepedencies(destination, dep, ALL_DEPENDENCIES.for(dep));
}

// var Dependency = CoreObject.extend({
//   init: function() {
//   }
// });

// var Resolver = CachingWriter.extend({
//   init: function(depGraph) {
//     if (typeof depGraph === 'object') {
//       this.depGraph = depGraph;
//     } else if (typeof depGraph === 'function') {
//       this.depGraph = new DependencyGraph();
//     } else {
//       throw new Error('You must pass a constructor or object');
//     }
//   },
//   resolve: function() {},

// });


var app = 'app';
app = find(app, '**/*.js');

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

app = mergeTrees([momentApp, app], {overwrite: true});
app = rename(mergeTrees([app , momentAddon]), 'app/', 'packager-proto/');

app = new ES6Modules(app, {
  esperantoOptions: {
    absolutePaths: true,
    strict: true
  }
});


function moveGraphs() {
  app = rename(app, 'ember-moment/', 'staging/ember-moment/');

  var addon = new Funnel(app, {
    srcDir: 'staging/',
    include: ['**/dep-graph.json'],
    destDir: '/'
  });
  app = rm(app, 'staging/**/dep-graph.json');
  app = mergeTrees([app, addon]);
}
moveGraphs();


var app = resolve('/packager-proto', find(app, 'packager-proto'));

// var addons = log(find(app, '**/dep-graph.json');



// dist/~my-app

// appDependencies = withDependencies(app, {

// });

// dist/~my-app
// dist/ember-moment/addon/...
// dist/dependency-graph.json


app = log(app);




// app = concat(app, {
//   inputFiles: ['**/*.js'],
//   outputFile: '/~packager-proto/app.js'
// });


module.exports = app;
