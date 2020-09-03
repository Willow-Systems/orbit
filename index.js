const music = require("./musicmanager.js");
const api = require("./clientapi.js");
var fs = require("fs");
const yargs = require('yargs');
config = {};
util = {
  config: function() {
    return config
  },
  log: log,
  generateUUID: uuidv4
}

function loadConfig() {
  try {
    var i = fs.readFileSync("config.json", "UTF-8");
    c = JSON.parse(i);
    c = validateAndUpdateConfig(c);
    if (JSON.stringify(c) != i) { writeConfig(c) }
    return c
  } catch (e) {
    log("Error reading configuration file 'config.json'. Run with --resetconfig to fix", "error");
    log("Error: " + e, "debug");
    process.exit();
  }
}
function initNewConfig() {
  console.log("Creating new config file")
  writeConfig(validateAndUpdateConfig({}))
  process.exit()
}
function writeConfig(c) {
  log("Saving config file", "info")
  log("Config: " + JSON.stringify(c), "debug")
  fs.writeFileSync("config.json", JSON.stringify(c), "UTF-8")
}
function validateAndUpdateConfig(c) {
  //Accept a config object and bring it up to date with the latest format
  c.loglevel = (c.loglevel == null) ? "info" : c.loglevel

  if (c.music == null) {
    c.music = {};
  }
  c.music.dirs = (c.music.dirs == null) ? [] : c.music.dirs

  if (c.interface == null) {
    c.interface = {}
  }
  c.interface.port = (c.interface.port == null) ? 8081 : c.interface.port

  return c
}
function log(text, level) {
  var permittedlevels = ["verbose","debug","info","warn","error"]
  level = (! permittedlevels.includes(level)) ? "info" : level
  ll = (config == undefined || config.loglevel == undefined) ? "info" : config.loglevel

  if (permittedlevels.indexOf(level) >= permittedlevels.indexOf(ll)) {
    console.log(text)
  }
}
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function parseCommandLineArgs() {
  const argv = yargs
  .option('resetconfig', {
        alias: "resetconfig",
        description: 'Create a default configuration file',
        type: 'boolean',
  })
  .option('verbosity', {
        alias: "v",
        description: 'The output verbosity. Choose from Warn, Error, Info, Debug in order of least to most verbose.',
        type: 'string',
  })
  .argv;

  if (argv.verbosity) {
    config.loglevel = argv.verbosity
  }

  if (argv.resetconfig) {
    initNewConfig();
  }
}

function init() {
  parseCommandLineArgs();
  config = loadConfig();
  parseCommandLineArgs();

  log("Starting Orbit...", "info");
  music.init();
  api.init();
}

init();
