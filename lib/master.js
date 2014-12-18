var Fiber = require('fibers');
var fiberUtils = require('./fiber_utils');
var reporter = require('./reporter');
var spawn = require('child_process').spawn;
var byline = require('byline');
var config = require('../config');

/**
 * Spawn a runner process for a single browser.
 *
 * @param {String} browser
 * @param {Array} args
 * @param {Function} done
 */
var spawnRunner = function (browser, args, done) {
  args = args.concat(['--browser', browser]);
  var runner = spawn(process.execPath, args);
  byline(runner.stdout).on('data', function (line) {
    var payload;
    try {
      payload = JSON.parse(line.toString());
    } catch (e) {
      // If the output from the runner process is not valid
      // JSON, treat it as plain text log.
      reporter.reportEvent(browser, ['log', line.toString()]);
      return;
    }
    reporter.reportEvent(browser, payload);
  });
  byline(runner.stderr).on('data', function (line) {
    reporter.reportError(browser, line.toString());
  });
  runner.on('exit', done);
};

/**
 * Spawn a batch of runner processes in parallel.
 * This function is fiber-wrapped.
 *
 * @param {Array} batch
 * @param {Array} args
 * @param {Function} done
 */
var spawnBatch = fiberUtils.wrapAsync(function (batch, args, done) {
  var pending = batch.length;
  batch.forEach(function (browser) {
    spawnRunner(browser, args, function () {
      pending--;
      if (! pending) done();
    });
  });
});

// exposed API
// the options here are the parsed command line arguments
// provided to run.js
exports.run = function (options) {

  // check max concurrency
  var maxConcurrency = options.concurrency || 4;

  // check the browsers to launch.
  // the argument could be a comma-separated list, where each
  // item is a listName in `config.browserLists`.
  var browsers = (options.browsers || 'all')
    .split(',')
    .reduce(function (result, listName) {
      var list = config.browserLists[listName];
      if (! list) {
        console.error('Invalid browser list: ' + listName);
        return result;
      }
      return result.concat(list);
    }, []);

  // build up the argument list for runner processes
  var runnerArgs = [__dirname + '/test_runner.js'];
  // pass down files list to child
  runnerArgs = runnerArgs.concat(options.files);
  // pass down local flag to child
  if (options.local) {
    runnerArgs = runnerArgs.concat(['--local']);
  }
  // XXX Oauth providers
  // using env variable because we also use it for
  // Jenkins build matrix
  if (options.providers) {
    process.env.TEST_OAUTH_PROVIDERS = options.providers
  }

  // launch the runner processes!
  Fiber(function () {
    var alreadyRun = 0;
    while (alreadyRun < browsers.length) {
      var batch = browsers
        .slice(alreadyRun, alreadyRun + maxConcurrency);
      spawnBatch(batch, runnerArgs);
      alreadyRun += maxConcurrency;
    }
    reporter.reportAll();

    if (!reporter.allTestsPassed())
      process.exit(1);
  }).run();
};
