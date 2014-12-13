var providersToRun = function () {
  var _ = require('underscore');
  var allProviders = require('./oauth_providers');

  if (process.env.TEST_OAUTH_PROVIDERS) {
    var providerList = process.env.TEST_OAUTH_PROVIDERS.split(',');
    return _.filter(allProviders, function (provider) {
      return _.contains(providerList, provider.name);
    });
  } else {
    return allProviders;
  }
};

describe('A small app with accounts', function () {

  var openDropdown = function () {
    find("#login-sign-in-link, #login-name-link").click();
  };
  var closeDropdown = function () {
    find("a.login-close-text").click();
  };

  var startSignIn = function (providerName) {
    find('#login-buttons-' + providerName).click();
  };

  var expectSignedIn = function (userDisplayName) {
    expect(find('#login-name-link').text()).to.contain(userDisplayName);
  };

  var signOut = function () {
    find('#login-buttons-logout').click();
    expect(find("#login-sign-in-link").text()).to.contain("Sign in ▾");
  };

  before(function () {
    browser.get('http://rainforest-auth-qa.meteor.com');
  });

  providersToRun().forEach(function (provider) {
    describe("- " + provider.name + ' login', function () {
      before(function () {
        browser.refresh();
      });

      it('signs in', function () {

        openDropdown();
        expect(find("#login-buttons-" + provider.name).text()).to.contain("Sign in with");
        startSignIn(provider.name);

        // Should show a popup. Test that when we close the pop-up we
        // don't lose the ability to then log in again afterwards.
        browser.focusPopup();
        provider.waitForPopupContents();
        browser.close();

        browser.focusMainWindow();
        startSignIn(provider.name);
        browser.focusPopup();
        provider.waitForPopupContents();
        provider.signInInPopup();

        browser.focusMainWindow();

        expectSignedIn(provider.userDisplayName);
      });

      it('signs out', function () {
        openDropdown();
        signOut();
      });

      it('signs in a second time with (almost) no prompting', function () {
        openDropdown();
        startSignIn(provider.name);

        if (provider.signInInSecondPopup) {
          browser.focusPopup();
          provider.signInInSecondPopup();
          browser.focusMainWindow();
        }

        expectSignedIn(provider.userDisplayName);
      });

      it('signs out a second time', function () {
        openDropdown();
        signOut(provider.name);
      });

    });
  });
});
