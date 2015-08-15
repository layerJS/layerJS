#!/usr/bin/env node

var path = require('path'),
    Command = require('../lib/command.js'),
    Jasmine = require('../lib/jasmine.js');

var jasmine = new Jasmine({ projectBaseDir: path.resolve() });
var examplesDir = path.join(__dirname, '..', 'node_modules', 'jasmine-core', 'lib', 'jasmine-core', 'example', 'node_example');
var command = new Command(path.resolve(), examplesDir, console.log);

command.run(jasmine, process.argv.slice(2));