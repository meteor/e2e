// Initialize the test environment in which the actual test
// files will be run.
// 
// - attach global utlities, e.g. browser, expect, $
// - attach custom convenience methods to the browser, e.g.
//   methods that focus on the main window or popup.

var wd = require('./wd_with_sync');
var chai = require('chai');
var config = require('../config');
var _ = require('underscore');

exports.init = function (options, callback) {

  // attach chai.expect to global
  global.expect = chai.expect;

  // Create wd browser instance.
  // Are we running remote on saucelabs? Defaults to remote.
  var wdOptions = options.local ? undefined : config.remote;
  var browser = global.browser = wd.remote(wdOptions);

  // XXX add custom methods to the browser here.

  /**
   * Convenience method that waits for an element by CSS selector.
   *
   * @param  {String|Array} selectors
   * @param  {Number} timeout - optional.
   */
  browser.waitFor = function (selectors, timeout) {
    // wait a bit longer than the default which is 1000ms
    // since things can be pretty slow over the wire
    timeout = timeout || 10000;
    var wait = function (selector) {
      browser.waitForElementByCssSelector(selector, timeout);
    };
    if (Array.isArray(selectors)) {
      selectors.forEach(wait);
    } else {
      wait(selectors);
    }
  };

  /**
   * Convenience method that waits for and retrives an element
   * by CSS selector, just like jQuery!
   *
   * @param  {String} selector
   * @param  {Number} timeout - optional.
   * @return {WebDriverElement}
   */
  browser.$ = global.$ = function (selector, timeout) {
    browser.waitFor(selector, timeout);
    return browser.elementByCssSelector(selector);
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
  browser.focusPopup = function () {
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
  // use the test directories as tags so we know what tests were
  // run on SauceLabs
  browserOptions.tags = options._.length ? options._ : ['all'];
  // connect the browser, then call the callback.
  browser.init(browserOptions, function () {
    // store main window handle
    var windowHandles = browser.windowHandles();
    expect(windowHandles).to.have.length(1);
    mainWindowHandle = windowHandles[0];
    // Done!
    callback();
  });
};

exports.teardown = function (code) {
  global.browser.quit(function () {
    process.exit(code);
  });
};
