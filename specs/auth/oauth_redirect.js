var excludedPairs = [
  ['safari', 'github'],
  ['safari', 'meteor-developer'],
  ['ie8', 'meteor-developer'],
  ['ie9', 'meteor-developer']
];

var providersToRun = function () {
  var _ = require('underscore');
  var allProviders = require('./oauth_providers').filter(function (provider) {
    return ! excludedPairs.some(function (pair) {
      return pair[0] === browser.name && pair[1] === provider.name;
    });
  });

  if (process.env.TEST_OAUTH_PROVIDERS) {
    var providerList = process.env.TEST_OAUTH_PROVIDERS.split(',');
    return allProviders.filter(function (provider) {
      return _.contains(providerList, provider.name);
    });
  } else {
    return allProviders;
  }
};

describe('A small app with accounts', function () {

  var openDropdown = function () {
    browser.find("#login-sign-in-link, #login-name-link").click();
  };
  var closeDropdown = function () {
    browser.find("a.login-close-text").click();
  };

  var startSignIn = function (providerName) {
    browser.find('#login-buttons-' + providerName).click();
  };

  var expectSignedIn = function (userDisplayName) {
    expect(browser.find('#login-name-link', 30000).text()).to.contain(userDisplayName);
  };

  var expectSignedOut = function () {
    expect(browser.find("#login-sign-in-link", 30000).text()).to.contain("Sign in ▾");
  };

  var signOut = function () {
    browser.find('#login-buttons-logout').click();
    expectSignedOut();
  };

  before(function () {
    browser.get('http://rainforest-auth-qa.meteor.com');
  });

  providersToRun().forEach(function (provider) {
    describe("- " + provider.name + ' login', function () {
      // these steps are sequential and stateful in nature, so stop
      // after first failures.
      this.bail(true);

      before(function () {
        browser.refresh();
      });

      it('redirect to sign in page', function () {

        browser.wait('#login-sign-in-link', 30000);

        openDropdown();
        expect(browser.find("#login-buttons-" + provider.name).text()).to.contain("Sign in with");
        startSignIn(provider.name);

      });

      it('sign in page loads', function () {
        provider.waitForRedirectPage();
      });

      it('cancel sign in', function () {
        provider.cancelSignIn();
        expectSignedOut();
      });

      it('perform sign in', function () {
        startSignIn(provider.name);
        provider.waitForRedirectPage();
        provider.signInInRedirectPage();
      });

      it('signs in in app', function () {
        expectSignedIn(provider.userDisplayName);
      });

      it('signs out', function () {
        openDropdown();
        signOut();
      });

      it('open login popup after having previously logged in', function () {
        openDropdown();
        startSignIn(provider.name);
      });

      if (provider.signInInSecondRedirect) {
        it('sign in redirect page after having previously logged in', function () {
          provider.signInInSecondRedirect();
        });
      }

      it('signs in in app again', function () {
        expectSignedIn(provider.userDisplayName);
      });

      it('signs out a second time', function () {
        openDropdown();
        signOut(provider.name);
      });

    });
  });
});
