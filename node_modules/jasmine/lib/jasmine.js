var path = require('path'),
    util = require('util'),
    glob = require('glob'),
    exit = require('./exit'),
    ExitCodeReporter = require('./reporters/exit_code_reporter'),
    ConsoleSpecFilter = require('./filters/console_spec_filter');

module.exports = Jasmine;
module.exports.ConsoleReporter = require('./reporters/console_reporter');

function Jasmine(options) {
  options = options || {};
  var jasmineCore = options.jasmineCore || require('jasmine-core');
  this.jasmineCorePath = path.join(jasmineCore.files.path, 'jasmine.js');
  this.jasmine = jasmineCore.boot(jasmineCore);
  this.projectBaseDir = options.projectBaseDir || path.resolve();
  this.printDeprecation = options.printDeprecation || require('./printDeprecation');
  this.specFiles = [];
  this.helperFiles = [];
  this.env = this.jasmine.getEnv();
  this.reportersCount = 0;
  this.exitCodeReporter = new ExitCodeReporter();
  this.onCompleteCallbackAdded = false;
  this.exit = exit;
  this.showingColors = true;
}

Jasmine.prototype.showColors = function(value) {
  this.showingColors = value;
};

Jasmine.prototype.addSpecFile = function(filePath) {
  this.specFiles.push(filePath);
};

Jasmine.prototype.addReporter = function(reporter) {
  this.env.addReporter(reporter);
  this.reportersCount++;
};

Jasmine.prototype.configureDefaultReporter = function(options) {
  options.timer = options.timer || new this.jasmine.Timer();
  options.print = options.print || function() {
    process.stdout.write(util.format.apply(this, arguments));
  };
  options.showColors = options.hasOwnProperty('showColors') ? options.showColors : true;
  options.jasmineCorePath = options.jasmineCorePath || this.jasmineCorePath;

  if(options.onComplete) {
    this.printDeprecation('Passing in an onComplete function to configureDefaultReporter is deprecated.');
  }
  var consoleReporter = new module.exports.ConsoleReporter(options);
  this.addReporter(consoleReporter);
  this.defaultReporterAdded = true;
};

Jasmine.prototype.addMatchers = function(matchers) {
  this.jasmine.Expectation.addMatchers(matchers);
};

Jasmine.prototype.loadSpecs = function() {
  this.specFiles.forEach(function(file) {
    require(file);
  });
};

Jasmine.prototype.loadHelpers = function() {
  this.helperFiles.forEach(function(file) {
    require(file);
  });
};

Jasmine.prototype.loadConfigFile = function(configFilePath) {
  var absoluteConfigFilePath = path.resolve(this.projectBaseDir, configFilePath || 'spec/support/jasmine.json');
  var config = require(absoluteConfigFilePath);
  this.loadConfig(config);
};

Jasmine.prototype.loadConfig = function(config) {
  var jasmineRunner = this;
  jasmineRunner.specDir = config.spec_dir;

  if(config.helpers) {
    config.helpers.forEach(function(helperFile) {
      var filePaths = glob.sync(path.join(jasmineRunner.projectBaseDir, jasmineRunner.specDir, helperFile));
      filePaths.forEach(function(filePath) {
        if(jasmineRunner.helperFiles.indexOf(filePath) === -1) {
          jasmineRunner.helperFiles.push(filePath);
        }
      });
    });
  }

  this.env.throwOnExpectationFailure(config.stopSpecOnExpectationFailure);

  if(config.spec_files) {
    jasmineRunner.addSpecFiles(config.spec_files);
  }
};

Jasmine.prototype.addSpecFiles = function(files) {
  var jasmineRunner = this;

  files.forEach(function(specFile) {
    var filePaths = glob.sync(path.join(jasmineRunner.projectBaseDir, jasmineRunner.specDir, specFile));
    filePaths.forEach(function(filePath) {
      if(jasmineRunner.specFiles.indexOf(filePath) === -1) {
        jasmineRunner.specFiles.push(filePath);
      }
    });
  });
};

Jasmine.prototype.onComplete = function(onCompleteCallback) {
  this.exitCodeReporter.onComplete(onCompleteCallback);
  this.onCompleteCallbackAdded = true;
};

Jasmine.prototype.stopSpecOnExpectationFailure = function(value) {
  this.env.throwOnExpectationFailure(value);
};

Jasmine.prototype.execute = function(files, filterString) {
  this.loadHelpers();

  if(this.reportersCount === 0) {
    this.configureDefaultReporter({ showColors: this.showingColors });
  }

  if(filterString) {
    var specFilter = new ConsoleSpecFilter({
      filterString: filterString
    });
    this.env.specFilter = function(spec) {
      return specFilter.matches(spec.getFullName());
    };
  }

  if (files && files.length > 0) {
    this.specDir = '';
    this.specFiles = [];
    this.addSpecFiles(files);
  }

  this.loadSpecs();

  if(!this.onCompleteCallbackAdded && this.defaultReporterAdded) {
    var jasmineRunner = this;
    this.exitCodeReporter.onComplete(function(passed) {
      if(passed) {
        jasmineRunner.exit(0, process.platform, process.version, process.exit, require('exit'));
      }
      else {
        jasmineRunner.exit(1, process.platform, process.version, process.exit, require('exit'));
      }
    });
  }

  this.addReporter(this.exitCodeReporter);
  this.env.execute();
};
