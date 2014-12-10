var providers = require('./oauth_providers');

describe('A small app with accounts', function () {

  var openDropdown = function () {
    $("#login-sign-in-link, #login-name-link", 30000).click();
  };
  var closeDropdown = function () {
    $("a.login-close-text").click();
  };

  it('shows a "Sign in" dropdown', function () {
    browser.get('http://rainforest-auth-qa.meteor.com');
    expect($("#login-sign-in-link").text()).to.contain("Sign in ▾");
  });

  it('has password login', function () {
    openDropdown();

    browser.waitFor('#login-email');
    browser.waitFor('#login-password');
    expect($("#login-buttons-password").text()).to.contain("Sign in");

    closeDropdown();
  });

  var startSignIn = function (providerName) {
    $('#login-buttons-' + providerName).click();
  };

  var expectSignedIn = function (userDisplayName) {
    expect($('#login-name-link').text()).to.contain(userDisplayName);
  };

  var signOut = function () {
    $('#login-buttons-logout').click();
    expect($("#login-sign-in-link").text()).to.contain("Sign in ▾");
  };

  providers.forEach(function (provider) {
    describe("- " + provider.name + ' login', function () {
      before(function () {
        browser.refresh();
      });

      it('signs in', function () {

        openDropdown();
        expect($("#login-buttons-" + provider.name).text()).to.contain("Sign in with");
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
