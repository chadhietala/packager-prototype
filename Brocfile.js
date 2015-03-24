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

  write: function(readTree, destDir) {
    var self = this;
    return readTree(this.inputTree).then(function(srcDir) {

      self.entries.forEach(function(entry) {
        var topImports = self.readGraph(entry, path.join(srcDir, entry, 'dep-graph.json'));
        self.resolve(srcDir, destDir, topImports);
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
    var self = this;
    imports = uniq(flatten(imports))

    imports = imports.filter(function(imprt) {
      var package = imprt.split('/')[0]
      return fs.existsSync(path.join(srcDir, package));
    }).forEach(function(imprt) {
      symlinkOrCopySync(path)
    });


    // this.syncForwardDepedencies(destDir, imports);
  },



  cleanup: function() {
    fs.removeSync(this.tmpDestDir);
  }

})





// var AllDependencyGraphs = CoreObject.extend({});

// var DependencyGraph = CoreObject.extend({
//   init: function(inputTree, options) {
//     this.inputTree = inputTree;
//     this.options = options;   
//     this.allDependencies = this.options.allDependencies;
//   },
//   read: function(readTree) {
//     return readTree(this.inputTree).then(function(srcDir) {
//       var depGraph = walkSync(srcDir).filter(function(path) {
//         return path === '/dep-graph.json'; 
//       })[0];
//       var depGraphJson = fs.readJSONSync(path.join(srcDir, depGraph));
//       return '/';
//     });
//   },
//   cleanup: function() {},
//   update: function() {},
//   for: function(name) {
//   }
// });

// var ALL_DEPENDENCIES = {
//   allDependencies: [],
//   for: function(dep) {

//   }
// };

// function syncForwardDepedencies(destination, dep, dependencies ) {
//   // TODO 
//   // Once again we just care about ember-moment at this point 
//   var imports = uniq(flatten(Object.keys(dependencies).map(function (file) {
//     return dependencies[file].imports;
//   }))).filter(function(imprt) {
//     return imprt.indexOf('ember-moment') > -1;
//   });

//   imports.forEach(function (argument) {
//     // body...
//   });
// }

// var DepMapper = CoreObject.extend({
//   init: function(inputTree, options) {
//     this.inputTree = inputTree;
//     this.entries = options.entries;
//     this.graphs = null;
//     if (!options) {
//       options = {};
//     }

//     this.setupForStaging();

//   },
//   setupForStaging: function() {
//     this.graphs = new Funnel(this.inputTree, {
//       include: ['**/dep-graph.json']
//     });
//     this.staging = this.inputTree;
//   },

//   read: function(readTree) {
//     quickTemp.makeOrRemake(this, 'tmpDestDir');
//     return Promise.resolve(this.write(readTree, this.tmpDestDir)).then(function () {
//       return this.tmpDestDir;
//     }.bind(this));
//   },

//   write: function(readTree, destDir) {
//     this.stagingFs = new Bfs(this.inputTree);
//     this.prePackageFs = new Bfs();

//     return readTree(find(this.stagingFs.fs, '**/{dep-graph.json}'), ).then(function(srcDir) {





//     });











//     return readTree(this.graphs).then(function(srcDir) {
//       var paths = walkSync(srcDir);

//       return mapSeries(paths, function(relativePath) {
//         if (relativePath.slice(-1) === '/') {
//           fs.mkdirsSync(destDir + '/' + relativePath);
//         } else {
          
//           var dep = relativePath.split('/')[0]
//           var dest = destDir + '/' + relativePath.split('/')[0];
//           var deps = fs.readJSONSync(path.join(srcDir, relativePath));

//           return this.resolve(dest, dep);
//           // var appGraph = fs.readJSONSync(path.join(srcDir, this.app, 'dep-graph.json'));
//           // var files = Object.keys(appGraph);

//           // var deps = uniq(flatten(files.map(function(file) {
//           //   return appGraph[file].imports.filter(function(imprt) {
//           //      return imprt !== 'exports';
//           //   }, this);
//           // }, this)));


//           // var packages = uniq(deps.map(function(dep) {
//           //   return dep.split('/')[0];
//           // }));

//           // // TODO 
//           // // this removes all the packages except ember-moment
//           // packages.splice(packages.indexOf('ember'), 1);

//           // packages.forEach(function (package) {
//           //   fs.mkdirsSync(srcDir + '/' + package);
//           // });

//           // console.log(packages);

//           // syncForwardDepedencies(srcDir, this.app, appGraph);

//           // return Promise.resolve();
//         }

         
//       }.bind(this));
//     }.bind(this));
//   },

//   resolve: function(destination, dep) {
//     return this.syncForwardDepedencies(destination, dep).then(function(linked) {
//       // return this.depsFor(linked).then(function(linkedDependencies) {
//       //   this.ALL_DEPENDENCIES.update(linked.name, linkedDependencies);
//       //   return Promise.all(this.)
//       // }.bind(this));
//     }.bind(this));
//   },

//   syncForwardDepedencies: function(destination, dep) {
//     console.log(destination, dep);

//     return Promise.resolve();
//     // return new Promise(function(resolve, reject) {

//     // });
//   },

//   cleanup: function() {
//     fs.removeSync(this.tmpDestDir);
//   }
// });






// function resolve(destination, dep) {
//   return syncForwardDepedencies(destination, dep, ALL_DEPENDENCIES.for(dep));
// }


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


// function moveGraphs() {
//   app = rename(app, 'ember-moment/', 'staging/ember-moment/');

//   var addon = new Funnel(app, {
//     srcDir: 'staging/',
//     include: ['**/dep-graph.json'],
//     destDir: '/'
//   });
//   app = rm(app, 'staging/**/dep-graph.json');
//   app = mergeTrees([app, addon]);
// }
// moveGraphs();

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
