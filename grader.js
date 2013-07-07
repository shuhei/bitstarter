#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = 'index.html';
var CHECKFILE_DEFAULT = 'checks.json';

function assertFileExists(infile) {
  var instr = infile.toString();
  if (!fs.existsSync(instr)) {
    console.error("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
}

function cheerioHtmlFile(htmlfile) {
  return cheerio.load(fs.readFileSync(htmlfile));
}

function loadChecks(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
}

function checkHtmlFile(htmlfile, checksfile) {
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile);
  var out = {};
  for (var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
}

function clone(fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
}


if (require.main == module) {
  program
      .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKFILE_DEFAULT)
      .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
      .parse(process.argv);
  var checkJson = checkHtmlFile(program.file, program.checks);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
} else {
  exports.checkHtmlFile = checkHtmlFile;
}

