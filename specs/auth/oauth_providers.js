// all accounts have the same email and password
var email = "meteorauthqa@gmail.com";

if (!process.env.OAUTH_PROVIDERS_PASSWORD) {
  console.error("Need to set OAUTH_PROVIDERS_PASSWORD environment variable");
  process.exit(1);
}
var password = process.env.OAUTH_PROVIDERS_PASSWORD;

module.exports = [
  {
    name: 'github',
    userDisplayName: 'Meteor AuthQA',
    waitForPopupContents: function () {
      expect(browser.find('#login', 30000).text()).to.contain("Sign in");
    },
    signInInPopup: function () {
      browser.find('#login_field').type(email);
      browser.find('#password').type(password);
      browser.find('input[name=commit]').click();
    }
  },
  {
    name: 'google',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(browser.find('h2', 30000).text()).to.contain("Sign in with your Google Account");
    },
    signInInPopup: function () {
      browser.find('#Email').type(email);
      browser.find('#Passwd').type(password);
      browser.find('input[name=signIn]').click();
    }
  },
  {
    name: 'facebook',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(browser.find('#login_form', 30000).text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      browser.find('#email').type(email);
      browser.find('#pass').type(password);
      browser.find('input[name=login]').click();
    }
  },
  {
    name: 'twitter',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(browser.find('div.auth h2', 30000).text()).to.contain("Authorize Meteor Auth QA");
    },
    signInInPopup: function () {
      browser.find('#username_or_email').type(email);
      browser.find('#password').type(password);
      browser.find('#allow').click();

      // Mysteriously, on some browsers, Twitter requires also
      // clicking on "Authorize App" on every sign in.
      try {
        browser.find('#allow', 30000).click();
      } catch (e) {
        // Twitter decided not to require this step this time.  Why?
      }
    }
  },
  {
    name: 'weibo',
    userDisplayName: 'AuthMeteor',
    waitForPopupContents: function () {
      expect(browser.find('p.oauth_main_info', 30000).text()).to.contain("meteor_auth_qa");
    },
    signInInPopup: function () {
      browser.find('#userId').type(email);
      browser.find('#passwd').type(password);
      browser.find('a[action-type=submit]').click();
    }
  },
  {
    name: 'meteor-developer',
    userDisplayName: 'meteorauthqa',
    waitForPopupContents: function () {
      expect(browser.find('div.header', 30000).text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      browser.find('input[name=usernameOrEmail]').type(email);
      browser.find('input[name=password]').type(password);
      browser.find('input[type=submit]').click();
    },
    signInInSecondPopup: function () {
      browser.find('a.login-with-account').click(); // "Use this account"
    }
  },
  {
    name: 'meetup',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(browser.find('#paneLogin', 30000).text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      browser.find('#email').type(email);
      browser.find('#password').type(password);
      browser.find('input[type=submit]').click();
    }
  }
];
