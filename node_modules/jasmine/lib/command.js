var path = require('path'),
    fs = require('fs');

exports = module.exports = Command;

var subCommands = {
  init: {
    description: 'initialize jasmine',
    action: initJasmine
  },
  examples: {
    description: 'install examples',
    action: installExamples
  },
  help: {
    description: 'show help',
    action: help,
    alias: '-h'
  },
  version: {
    description: 'show jasmine and jasmine-core versions',
    action: version,
    alias: '-v'
  }
};

function Command(projectBaseDir, examplesDir, print) {
  this.projectBaseDir = projectBaseDir;
  this.specDir = path.join(projectBaseDir, 'spec');

  var command = this;

  this.run = function(jasmine, commands) {
    setEnvironmentVariables(commands);

    var commandToRun;
    Object.keys(subCommands).forEach(function(cmd) {
      var commandObject = subCommands[cmd];
        if (commands.indexOf(cmd) >= 0) {
        commandToRun = commandObject;
      } else if(commandObject.alias && commands.indexOf(commandObject.alias) >= 0) {
        commandToRun = commandObject;
      }
    });

    if (commandToRun) {
      commandToRun.action({projectBaseDir: command.projectBaseDir, specDir: command.specDir, examplesDir: examplesDir, print: print});
    } else {
      runJasmine(jasmine, parseOptions(commands));
    }
  };
}

function isFileArg(arg) {
  return arg.indexOf('--') !== 0 && !isEnvironmentVariable(arg);
}

function parseOptions(argv) {
  var files = [],
      color = process.stdout.isTTY || false,
      filter,
      stopOnFailure;
  argv.forEach(function(arg) {
    if (arg === '--no-color') {
      color = false;
    } else if (arg.match("^--filter=")) {
      filter = arg.match("^--filter=(.*)")[1];
    }
    else if (arg.match("^--stop-on-failure=")) {
      stopOnFailure = arg.match("^--stop-on-failure=(.*)")[1] === 'true';
    }
    else if (isFileArg(arg)) {
      files.push(arg);
    }
  });
  return {
    color: color,
    filter: filter,
    stopOnFailure: stopOnFailure,
    files: files
  };
}

function runJasmine(jasmine, env) {
  jasmine.loadConfigFile(process.env.JASMINE_CONFIG_PATH);
  if (env.stopOnFailure !== undefined) {
    jasmine.stopSpecOnExpectationFailure(env.stopOnFailure);
  }

  jasmine.showColors(env.color);
  jasmine.execute(env.files, env.filter);
}

function initJasmine(options) {
  var print = options.print;
  var specDir = options.specDir;
  makeDirStructure(path.join(specDir, 'support/'));
  if(!fs.existsSync(path.join(specDir, 'support/jasmine.json'))) {
    fs.writeFileSync(path.join(specDir, 'support/jasmine.json'), fs.readFileSync(path.join(__dirname, '../lib/examples/jasmine.json'), 'utf-8'));
  }
  else {
    print('spec/support/jasmine.json already exists in your project.');
  }
}

function installExamples(options) {
  var specDir = options.specDir;
  var projectBaseDir = options.projectBaseDir;
  var examplesDir = options.examplesDir;

  makeDirStructure(path.join(specDir, 'support'));
  makeDirStructure(path.join(specDir, 'jasmine_examples'));
  makeDirStructure(path.join(specDir, 'helpers', 'jasmine_examples'));
  makeDirStructure(path.join(projectBaseDir, 'lib', 'jasmine_examples'));

  copyFiles(
    path.join(examplesDir, 'spec', 'helpers', 'jasmine_examples'),
    path.join(specDir, 'helpers', 'jasmine_examples'),
    new RegExp(/[Hh]elper\.js/)
  );

  copyFiles(
    path.join(examplesDir, 'lib', 'jasmine_examples'),
    path.join(projectBaseDir, 'lib', 'jasmine_examples'),
    new RegExp(/\.js/)
  );

  copyFiles(
    path.join(examplesDir, 'spec', 'jasmine_examples'),
    path.join(specDir, 'jasmine_examples'),
    new RegExp(/[Ss]pec.js/)
  );
}

function help(options) {
  var print = options.print;
  print('Usage: jasmine [command] [options] [files]');
  print('');
  print('Commands:');
  Object.keys(subCommands).forEach(function(cmd) {
    var commandNameText = cmd;
    if(subCommands[cmd].alias) {
      commandNameText = commandNameText + ',' + subCommands[cmd].alias;
    }
    print('%s\t%s', lPad(commandNameText, 10), subCommands[cmd].description);
  });
  print('');
  print('If no command is given, jasmine specs will be run');
  print('');
  print('');

  print('Options:');
  print('%s\tturn off color in spec output', lPad('--no-color', 18));
  print('%s\tfilter specs to run only those that match the given string', lPad('--filter=', 18));
  print('%s\t[true|false] stop spec execution on expectation failure. This takes precedence over the stopSpecOnExpectationFailure option in jasmine.json', lPad('--stop-on-failure=', 18));
  print('');
  print('The path to your jasmine.json can be configured by setting the JASMINE_CONFIG_PATH environment variable');
}

function version(options) {
  var print = options.print;
  print('jasmine v' + require('../package.json').version);
  print('jasmine-core v' + require('../node_modules/jasmine-core/package.json').version);
}

function lPad(str, length) {
  if (str.length >= length) {
    return str;
  } else {
    return lPad(' ' + str, length);
  }
}

function copyFiles(srcDir, destDir, pattern) {
  var srcDirFiles = fs.readdirSync(srcDir);
  srcDirFiles.forEach(function(file) {
    if (file.search(pattern) !== -1) {
      fs.writeFileSync(path.join(destDir, file), fs.readFileSync(path.join(srcDir, file)));
    }
  });
}

function makeDirStructure(absolutePath) {
  var splitPath = absolutePath.split(path.sep);
  splitPath.forEach(function(dir, index) {
    if(index > 1) {
      var fullPath = path.join(splitPath.slice(0, index).join('/'), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath);
      }
    }
  });
}

function isEnvironmentVariable(command) {
  var envRegExp = /(.*)=(.*)/;
  return command.match(envRegExp);
}

function setEnvironmentVariables(commands) {
  commands.forEach(function (command) {
    var regExpMatch = isEnvironmentVariable(command);
    if(regExpMatch) {
      var key = regExpMatch[1];
      var value = regExpMatch[2];
      process.env[key] = value;
    }
  });
}
