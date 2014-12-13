// Initialize the test environment in which the actual test
// files will be run.
// 
// - attach global utlities, e.g. browser, expect, find
// - attach custom convenience methods to the browser, e.g.
//   methods that focus on the main window or popup.

var wd = require('./wd_with_sync');
var chai = require('chai');
var config = require('../config');
var _ = require('underscore');
var Fiber = require('fibers');
var Future = require('fibers/future');
var fiberUtils = require('./fiber_utils');

/**
 * Wrap a function into a wd waitForElement asserter. The wrapped function
 * receives a fiber-wrapped wd Element instance, and should return a Boolean
 * value. wd will poll the asserter until it returns true. This is useful when
 * we expect an existing element to change but don't know how long we should
 * wait.
 *
 * For example:
 *   browser.wait('#login-name-link', 30000, function (el) {
 *     return el.text().indexOf('changed text') > -1;
 *   });
 */
var elementMethods = Object.keys(require('wd/lib/element-commands'));
var wrapAsserter = function (fn) {
  if (fn) {
    return new wd.asserters.Asserter(function (el, cb) {
      el = fiberUtils.wrapAsyncObject(el, elementMethods);
      Fiber(function () {
        var res;
        try {
          res = fn(el);
        } catch (e) {
          return cb(e);
        }
        cb(null, res);
      }).run();
    });
  } else {
    return new wd.asserters.Asserter(function (el, cb) {
      cb(null, true);
    });
  }
};

exports.init = function (options, callback) {

  // attach chai.expect to global
  global.expect = chai.expect;

  // Create wd browser instance.
  // Are we running remote on saucelabs? Defaults to remote.
  var wdOptions = options.local ? undefined : config.remote();
  var browser = global.browser = wd.remote(wdOptions);

  // XXX add custom methods to the browser here.

  /**
   * Convenience method that waits for an element by CSS selector.
   *
   * @param  {String|Array} selectors
   * @param  {Number} timeout - optional.
   * @param  {Function} asserter - optional.
   */
  browser.wait = function (selectors, timeout, asserter) {
    timeout = timeout || 1000;
    // wrap the asserter function.
    asserter = wrapAsserter(asserter);
    var wait = function (selector) {
      browser.waitForElementByCssSelector(selector, asserter, timeout);
    };
    if (Array.isArray(selectors)) {
      selectors.forEach(wait);
    } else {
      wait(selectors);
    }
  };

  /**
   * Convenience method that waits for and retrives one single element
   * by CSS selector.
   *
   * @param  {String} selector
   * @param  {Number} timeout - optional.
   * @return {WebDriverElement}
   */
  browser.find = function (selector, timeout) {
    browser.wait(selector, timeout);
    var elements = browser.elementsByCssSelector(selector);
    expect(elements.length).to.equal(1);
    return elements[0];
  };

  /**
   * Convenience method that waits for and retrives all elements matching
   * given selector.
   *
   * @param  {String} selector
   * @param  {Number} timeout - optional.
   * @return {Array<WebDriverElement>}
   */
  browser.findAll = function (selector, timeout) {
    browser.wait(selector, timeout);
    return browser.elementsByCssSelector(selector);
  };

  /**
   * Count how many matched elements there are the page.
   *
   * @param {String} selector
   * @return {Number}
   */
  browser.count = function (selector) {
    return browser.elementsByCssSelector(selector).length;
  };

  /**
   * Wait for the given timeout.
   *
   * @param {Number} timeout
   */
  browser.sleep = function (timeout) {
    var fut = new Future;
    var cb = fut.resolver();
    Fiber(function () {
      setTimeout(cb, timeout);
    }).run();
    fut.wait();
  };

  // to be set after browser has initialized
  var mainWindowHandle;

  /**
   * Convenience method that focuses the main window
   */
  browser.focusMainWindow = function () {
    browser.window(mainWindowHandle);
  };

  /**
   * Convenience method that focuses the popup.
   * This assumes we are dealing with only 1 popup window.
   */
  browser.focusSecondWindow = function () {
    var popups = _.without(browser.windowHandles(), mainWindowHandle);
    expect(popups).to.have.length(1);
    browser.window(popups[0]);
  };

  // Which browser are we testing?
  var browserOptions = config.browserDescriptors[options.browser];
  if (!browserOptions) {
    console.error('Invalid browser: ' + options.browser);
    process.exit(1);
  }

  // When running locally on OSX the "platform" field causes a selenium error.
  if (options.local &&
      (options.browser === 'chrome' ||
       options.browser === 'safari')) {
    delete browserOptions.platform;
  }

  // use the test directories as tags so we know what tests were
  // run on SauceLabs
  browserOptions.tags = options._.length ? options._ : ['all'];
  // connect the browser, then call the callback.
  browser.init(browserOptions, function () {
    // store main window handle
    var windowHandles = browser.windowHandles();
    expect(windowHandles).to.have.length(1);
    mainWindowHandle = windowHandles[0];

    if (!options.local)
      console.log("Test running at https://saucelabs.com/tests/" + browser.sessionID);

    // Done!
    callback();
  });
};

exports.teardown = function (code) {
  global.browser.quit(function () {
    process.exit(code);
  });
};
