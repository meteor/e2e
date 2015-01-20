var sprintf = require('sprintf-js').sprintf;
var chalk = require('chalk');
var _ = require('underscore');
var oauthReporter = require('./oauth_reporter');
var failureBanner = require('./failure_banner');
var path = require('path');
var gray = chalk.gray;
var red = chalk.red;
var green = chalk.green;
var yellow = chalk.yellow;
var blue = chalk.blue;
var stats = {};

exports.noError = false;

/**
 * Helper that adds a browser prefix to a log message.
 *
 * @param {String} browser
 * @param {String} msg
 */
var log = function (browser, msg) {
  console.log(green(sprintf('%-12s', '[' + browser + ']')) + msg);
};

/**
 * Report an event from the runner json stream.
 *
 * @param  {String} browser
 * @param  {Array} event - ["pass", {...}]
 */
exports.reportEvent = function (browser, event) {
  var type = event[0];
  var data = event[1];
  switch (type) {
  case 'init':
    log(browser, gray('Initializing browser...'));
    break;
  case 'start':
    log(browser, gray('Test started. (' + data.total + ' total)'));
    break;
  case 'pass':
    var suiteTitle = data.fullTitle.replace(data.title, '');
    log(browser, green('✓ ') + yellow(suiteTitle) + data.title);
    break;
  case 'fail':
    log(browser, red('✗ ') + data.fullTitle);
    oauthReporter.fail(browser, data.fullTitle);
    break;
  case 'stack':
    data.stack.split('\n').forEach(function (line) {
      // shorten paths in stack trace
      var baseDir = process.cwd();
      line = line.replace(baseDir, path.basename(baseDir));

      log(browser, red('  ' + line));
    });
    break;
  case 'end':
    stats[browser] = data;
    break;
  case 'error':
    log(browser, red(data));
    break;
  case 'log':
    log(browser, blue('LOG: ' + data));
    break;
  case 'failureBanner':
    failureBanner.record(browser, data);
    break;
  }
  // TODO: send the event to a meteor app to display this info
};

/**
 * Report runner process error output line-by-line.
 *
 * @param {String} browser
 * @param {Object} event
 */
exports.reportError = function (browser, line) {
  log(browser, red(line));
};

/**
 * Report all browsers stats at the end.
 */
exports.reportAll = function () {
  console.log();
  for (var browser in stats) {
    var data = stats[browser];
    log(
      browser,
      data.tests + ' total' +
      (data.passes > 0 ? green(' / ' + data.passes + ' passed') : '') +
      (data.failures > 0 ? red(' / ' + data.failures + ' failed') : '') +
      gray(' (' + data.duration + 'ms)')
    );
  }
  console.log();
  oauthReporter.reportFailedPairs();
  failureBanner.print();
};

/**
 * Check if all tests passed
 *
 * @returns {Boolean}
 */
exports.allTestsPassed = function () {
  return _.all(stats, function (data) {
    return data.failures === 0;
  });
};
