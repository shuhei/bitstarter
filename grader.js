#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

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

function loadChecks(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
}

function checkHtmlFile(htmlContent, checksfile) {
  $ = cheerio.load(htmlContent);
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

function checkAndOut(htmlContent, checksFile) {
  var checkJson = checkHtmlFile(htmlContent, checksFile);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
}

if (require.main == module) {
  program
      .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKFILE_DEFAULT)
      .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
      .option('-u, --url <html_url>', 'URL to index.html')
      .parse(process.argv);
  if (program.url) {
    restler.get(program.url).on('complete', function (result) {
      if (result instanceof Error) {
        console.error('Failed to load %s', program.url);
      } else {
        checkAndOut(result, program.checks);
      }
    });
  } else {
    fs.readFile(program.file, function (err, data) {
      checkAndOut(data, program.checks);
    });
  }
} else {
  exports.checkHtmlFile = checkHtmlFile;
}

