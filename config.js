// SauceLabs config
exports.remote = function () {
  if (!process.env.SAUCE_LABS_ACCESS_KEY) {
    console.error("Need to set SAUCE_LABS_ACCESS_KEY environment variable");
    process.exit(1);
  }

  return {
    host: 'ondemand.saucelabs.com',
    port: 80,
    username: 'honeycomb',
    accessKey: process.env.SAUCE_LABS_ACCESS_KEY
  };
};

// WebDriver Browser Descriptors
// https://saucelabs.com/platforms/webdriver
var browserDescriptors = exports.browserDescriptors = {
  chrome: {
    browserName: 'chrome',
    version: 38,
    platform: 'OS X 10.10'
  },
  firefox: {
    browserName: 'firefox',
    version: 33
  },
  safari: {
    browserName: 'safari',
    version: 8,
    platform: 'OS X 10.10'
  },
  ie8: {
    browserName: 'internet explorer',
    version: 8,
    platform: 'Windows XP',
    prerun: 'http://s3.amazonaws.com/meteor-saucelabs/disable_ie8_slow_javascript_warning.bat'
  },
  ie9: {
    browserName: 'internet explorer',
    version: 9,
    platform: 'Windows 7'
  },
  ie10: {
    browserName: 'internet explorer',
    version: 10,
    platform: 'Windows 8'
  },
  ie11: {
    browserName: 'internet explorer',
    version: 11,
    platform: 'Windows 8.1'
  }
};

// Browser group configurations.
// These are used by the run script.
// e.g. `node run --browsers=all`
var browserLists = exports.browserLists = {};

// all browsers
browserLists.all = Object.keys(browserDescriptors);

// add individual browsers to the list
// so we can do `node run --browsers=chrome`
browserLists.all.forEach(function (name) {
  browserLists[name] = [name];
});

// XXX add your custom lists below.

// `node run --browsers=mylist`
// browserLists.mylist = ['chrome', 'firefox'];
