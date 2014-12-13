// This is a custom Mocha interface based on Mocha's own
// BDD interface (node_modules/mocha/lib/interfaces/bdd.js).
// Mocha's original implementation is copied here and all
// we're doing is wrapping a few methods like `it`, `before`
// and `after` so their callbacks run inside fibers.

/**
 * Module dependencies.
 */

var Fiber = require('fibers');
var Suite = require('mocha/lib/suite');
var Test = require('mocha/lib/test');
var escapeRe = require('mocha/node_modules/escape-string-regexp');
var mktemp = require('mktemp');
var path = require('path');
var fs = require('fs');

// Takes a screenshot of the current state of the test run
// and saves it to a file.
// XXX really shouldn't be in this file.
var screenshot = function () {
  var tmpFile = path.join(process.cwd(), mktemp.createFileSync('XXXXXX.png'));
  fs.writeFileSync(
    tmpFile,
    new Buffer(browser.takeScreenshot(), 'base64'));
  console.log("Screenshot can be found at: " + tmpFile);
};

/**
 * Wrap a raw BDD interface method so that its callback
 * runs inside a fiber.
 *
 * @param {Function} original
 */

var wrap = function (original) {
  return function (/* arguments */) {
    var args = [].slice.call(arguments);
    var fn = args[args.length - 1];
    var asyncRE = /^function.*\(\s*done\s*\)\s*\{/;
    var isVanillaAsync = asyncRE.test(fn.toString());
    // If `fn` is a vanilla async function that takes a `done`
    // callback, let the user call `done` instead of here.
    args[args.length - 1] = function (done) {
      Fiber(function () {
        try {
          fn(done);
        } catch (e) {
          screenshot();
          throw e;
        }

        if (! isVanillaAsync)
          done();
      }).run();
    };
    original.apply(null, args);
  };
};

// The interface function exported here gets called by
// mocha when loading its interface internally.
module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha){

    /**
     * Execute before running tests.
     */

    context.before = wrap(function (name, fn) {
      suites[0].beforeAll(name, fn);
    });

    /**
     * Execute after running tests.
     */

    context.after = wrap(function (name, fn) {
      suites[0].afterAll(name, fn);
    });

    /**
     * Execute before each test case.
     */

    context.beforeEach = wrap(function (name, fn) {
      suites[0].beforeEach(name, fn);
    });

    /**
     * Execute after each test case.
     */

    context.afterEach = wrap(function (name, fn) {
      suites[0].afterEach(name, fn);
    });

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    /**
     * Pending describe.
     */

    context.xdescribe =
    context.xcontext =
    context.describe.skip = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn){
      var suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
      return suite;
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = wrap(function(title, fn){
      var suite = suites[0];
      if (suite.pending) fn = null;
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    });

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn){
      var test = context.it(title, fn);
      var reString = '^' + escapeRe(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit =
    context.xspecify =
    context.it.skip = function(title){
      context.it(title);
    };
  });
};
