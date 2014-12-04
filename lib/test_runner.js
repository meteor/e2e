// This script sets up a Mocha test runner instance using
// our custom fiber-compatible bdd interface and runs
// specified tests in a **single** browser.

// We will run multiple processes of this script in parallel
// to test different browsers.

// dependencies
var minimist = require('minimist');
var Mocha = require('mocha');
var path = require('path');
var testInterface = require('./test_interface');
var testEnvironment = require('./test_env');

// parse command line argumetnts
var options = minimist(process.argv.slice(2));

// instantiate the runner instance
var mocha = new Mocha();
// use our custom interface
Mocha.interfaces['meteor-bdd'] = testInterface;
mocha.ui('meteor-bdd');
// global threshold for fail timeout
mocha.suite.timeout(50000);
// use json-stream reporter since it's more flexible
// for further processing. The stream emits events in the
// format of ["event", data] and writes them to stdout.
// the parent process will be notified of the event and
// report them.
mocha.reporter('json-stream');

// load all test files from the given directories
// by default, run all files inside `spec/` that ends with "spec.js".
mocha.files = [];
var directories = options._.length ? options._ : [''];
directories.forEach(function (directory) {
  var found = Mocha.utils.lookupFiles('specs/' + directory, ['js'], true);
  mocha.files = mocha.files.concat(found);
});

/**
 * We can also emit extra events to the parent process by
 * writing to stdout in the same format the json stream
 * reporter does.
 *
 * @param  {String} event
 * @param {Object} data - optional.
 */
var emitEvent = function (event, data) {
  event = [event];
  if (data) event.push(data);
  console.log(JSON.stringify(event));
};

// signal master script about initialization
emitEvent('init');

// initialize the test environment, then run the tests
testEnvironment.init(options, function startMocha () {
  // actually run mocha tests, and teardown test environment
  // after the tests complete
  var runner = mocha.run(testEnvironment.teardown);
  process.on('SIGINT', function () {
    runner.aboort();
  });
  // mocha's json stream reporter doesn't include error
  // stack trace, so we have to emit that ourselves...
  runner.on('fail', function (test, err) {
    emitEvent('stack', { stack: err.stack });
  });
});
