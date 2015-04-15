/* global require, module */

// LULZ need to remove about of this
var stew = require('broccoli-stew');
var ES6Modules = require('broccoli-es6modules');
var es6Transpiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var CoreObject = require('core-object');
var walkSync = require('walk-sync');
var fs = require('fs-extra');
var path = require('path');
var RSVP = require('rsvp');
var quickTemp = require('quick-temp');
var flatten = require('lodash-node/modern/array/flatten');
var uniq = require('lodash-node/modern/array/uniq');
var symlinkOrCopySync = require('symlink-or-copy').sync;
// var Bfs = require('broccoli-fs');
var find = stew.find;
var rename = stew.rename;
var PrePackager = require('ember-cli-pre-packager');

var AllDependencies = {
  _graph: {},
  update: function(entry, dependencies) {
    this._graph[entry] = dependencies;
  },

  for: function(file) {
    var parts = file.split('/');
    var entry = parts[0];

    if (!this._graph[entry]) {
      return null;
    }

    // Passed an entry
    if (this._graph[file]) {
      return this._graph[file];
    }

    // Passed a file
    return this._graph[entry][file].imports;    
  }
};

var DepMapper = CoreObject.extend({
  init: function(inputTree, options) {
    
    this.inputTree = inputTree;
    this.entries = options.entries;
  },
  read: function(readTree) {
    quickTemp.makeOrRemake(this, 'tmpDestDir');
    return RSVP.Promise.resolve(this.write(readTree, this.tmpDestDir)).then(function () {
      return this.tmpDestDir;
    }.bind(this));
  },

  write: function(readTree, destDir) {
    var self = this;
    return readTree(this.inputTree).then(function(srcDir) {
      return self.resolveEntries(srcDir, destDir);
    });
  },

  resolveEntries: function(srcDir, destDir) {
    var self = this;
    var paths = walkSync(srcDir);

    this.entries.forEach(function(entry) {
      var entryDepGraphPath = path.join(srcDir, entry, 'dep-graph.json');

      // Sync the entry
      paths.filter(self._isEntryFiles(entry)).forEach(function(relativePath) {
        self.syncForwardDependencies(path.join(destDir, relativePath), path.join(srcDir, relativePath));
      });

      self.resolve(srcDir, destDir, self.flattenEntryImports(entry, entryDepGraphPath));
    });

    return destDir;
  },

  _isEntryFiles:function(entry) {
    return function(relativePath) {
      return relativePath.indexOf(entry) > -1 && relativePath.slice(-1) !== '/' && relativePath.indexOf('dep-graph.json') < 0;
    };
  },

  syncForwardDependencies: function(destination, dep) {
    fs.mkdirsSync(path.dirname(destination));
    symlinkOrCopySync(dep, destination);
  },

  /**
   * This is only called for an entry e.g. an app or engine.
   * Since an entry is the entry node in the graph you can safely
   * just get the unique dependencies in the entry.
   * @param  {String} entry     A top level node
   * @param  {String} graphPath The path to dep-graph.json
   * @return {Array}            The direct dependencies for the entry
   */
  flattenEntryImports: function(entry, graphPath) {
    this.updateGraph(entry, graphPath);
    var graph = AllDependencies.for(entry);
    var files = Object.keys(graph);

    return uniq(flatten(files.map(function(file) {
      return AllDependencies.for(file);
    })));
  },

  updateGraph: function(entry, graphPath) {
    AllDependencies.update(entry, fs.readJSONSync(graphPath));
  },

  _getEntry: function(relativePath) {
    return relativePath.split('/')[0];
  },

  resolve: function(srcDir, destDir, imports) {
    var self = this, entry;
    
    imports.filter(function(imprt) {
      entry = self._getEntry(imprt);

      // NOTE: This is where we would need to actually introduce
      // alternative resolution paths. Current I'm filering out
      // the things like 'ember', 'moment', etc.
      return fs.existsSync(path.join(srcDir, entry));
    }).forEach(function(imprt) {
      entry = self._getEntry(imprt);
      imprt = imprt + '.js';

      var dep = path.join(srcDir, imprt);
      var depGraph = path.join(srcDir, entry, 'dep-graph.json');

      if (fs.existsSync(path.join(srcDir, imprt))) {
        var destination = path.join(destDir, imprt);

        self.syncForwardDependencies(destination, dep);

        if (!AllDependencies.for(entry)) {
          self.updateGraph(entry, depGraph);
          // We now look at the direct path to resolve all the
          // transitive dependencies.
          self.resolve(srcDir, destDir, AllDependencies.for(imprt));
        }

      }
    });
  },

  cleanup: function() {
    fs.removeSync(this.tmpDestDir);
  }

});

Error.stackTraceLimit = Infinity;
var ember = 'node_modules/ember';
var moment = 'node_modules/ember-moment';

fs.mkdirsSync('./node_modules/ember/addon');
fs.mkdirsSync('./node_modules/ember/app');
fs.copySync('./bower_components/ember/ember.debug.js', './' + ember + '/addon/ember.js');
fs.writeJsonSync('./' + ember + '/addon/dep-graph.json', {
  "ember.js": {
    "imports": [],
    "exports": ["NOT IMPLEMENTED YET"]
  }
});

var emberDep = find(ember + '/addon/{dep-graph.json}');
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


app = new ES6Modules(app, {
  esperantoOptions: {
    absolutePaths: true,
    strict: true
  }
});


// capture json

app = rename(app, 'app/', 'packager-proto/');

//app = mergeTrees([].concat(deps, app), {overwrite: true});


var bundle = stew.log(mergeTrees(addonFolders.concat([app])));


app = new PrePackager(stew.debug(bundle, { name: 'OMG' }), {
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
