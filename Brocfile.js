/* global require, module */

// LULZ need to remove about of this
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
var RSVP = require('rsvp');
var quickTemp = require('quick-temp');
var flatten = require('lodash-node/modern/array/flatten');
var uniq = require('lodash-node/modern/array/uniq');
var mapSeries = require('promise-map-series');
var symlinkOrCopySync = require('symlink-or-copy').sync;
// var Bfs = require('broccoli-fs');
var find = stew.find;
var mv = stew.mv;
var log = stew.log;
var rm = stew.rm;
var rename = stew.rename;

var AllDependencies = {
  graph: {},
  update: function(entry, dependencies) {
    this.graph[entry] = dependencies;
  },

  for: function(file) {
    var parts = file.split('/');
    var entry = parts[0];

    if (!this.graph[entry]) {
      return null;
    }

    if (!this.graph[entry][file]) {
      return null;
    }

    return this.graph[entry][file].imports;    
  }
};

var DepMapper = CoreObject.extend({
  init: function(inputTree, options) {
    
    this.inputTree = inputTree;
    this.entries = options.entries;
  },
  read: function(readTree) {
    quickTemp.makeOrRemake(this, 'tmpDestDir');
    return Promise.resolve(this.write(readTree, this.tmpDestDir)).then(function () {
      return this.tmpDestDir;
    }.bind(this));
  },

  _isEntryFiles:function(entry) {
    return function(relativePath) {
      return relativePath.indexOf(entry) > -1
             && relativePath.slice(-1) !== '/'
             && relativePath.indexOf('dep-graph.json') < 0;
    };
  },

  syncForwardDependencies: function(destination, dep) {
    fs.mkdirsSync(path.dirname(destination));
    symlinkOrCopySync(dep, destination);
  },

  write: function(readTree, destDir) {
    var self = this;
    return readTree(this.inputTree).then(function(srcDir) {
      var paths = walkSync(srcDir);

      self.entries.forEach(function(entry) {
        var entryDepGraphPath = path.join(srcDir, entry, 'dep-graph.json')
        // Sync the entry
        var entryFiles = paths.filter(self._isEntryFiles(entry)).forEach(function(relativePath) {
          self.syncForwardDependencies(path.join(destDir, relativePath), path.join(srcDir, relativePath));
        });

        self.resolve(srcDir, destDir, self.readGraph(entry, entryDepGraphPath));
      });

      return destDir;
    });
  },

  readGraph: function(entry, graphPath, destDir) {
    var graph = fs.readJSONSync(graphPath);
    AllDependencies.update(entry, graph);

    var files = Object.keys(graph);

    return files.map(function(file) {
      return AllDependencies.for(file);
    });
  },

  resolve: function(srcDir, destDir, imports) {
    imports = uniq(flatten(imports));
    var self = this;

    imports = imports.filter(function(imprt) {
      var package = imprt.split('/')[0];
      return fs.existsSync(path.join(srcDir, package));
    });

    imports = imports.forEach(function(imprt) {
      imprt = imprt + '.js';

      var package = imprt.split('/')[0];
      var dep = path.join(srcDir, imprt);
      var depGraph = path.join(srcDir, package, 'dep-graph.json');


      if (fs.existsSync(path.join(srcDir, imprt))) {
        var destination = path.join(destDir, imprt);

        self.syncForwardDependencies(destination, dep);

        if (!AllDependencies.graph[package]) {
          AllDependencies.update(package, fs.readJSONSync(depGraph));
          imports = AllDependencies.graph[package][imprt].imports;
          self.resolve(srcDir, destDir, imports);
        }

      }
    });
  },

  cleanup: function() {
    fs.removeSync(this.tmpDestDir);
  }

})


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

app = new DepMapper(app, {
  entries: ['packager-proto']
});


// var app = resolve('/packager-proto', find(app, 'packager-proto'));

// var addons = log(find(app, '**/dep-graph.json');



// dist/~my-app

// appDependencies = withDependencies(app, {

// });

// dist/~my-app
// dist/ember-moment/addon/...
// dist/dependency-graph.json


// app = log(app);




// app = concat(app, {
//   inputFiles: ['**/*.js'],
//   outputFile: '/~packager-proto/app.js'
// });


module.exports = app;
