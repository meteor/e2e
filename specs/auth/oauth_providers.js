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
      expect(find('#login', 30000).text()).to.contain("Sign in");
    },
    signInInPopup: function () {
      find('#login_field').type(email);
      find('#password').type(password);
      find('input[name=commit]').click();
    }
  },
  {
    name: 'google',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(find('h2', 30000).text()).to.contain("Sign in with your Google Account");
    },
    signInInPopup: function () {
      find('#Email').type(email);
      find('#Passwd').type(password);
      find('input[name=signIn]').click();
    }
  },
  {
    name: 'facebook',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(find('#login_form', 30000).text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      find('#email').type(email);
      find('#pass').type(password);
      find('input[name=login]').click();
    }
  },
  {
    name: 'twitter',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(find('div.auth', 30000).text()).to.contain("Authorize Meteor Auth QA");
    },
    signInInPopup: function () {
      find('#username_or_email').type(email);
      find('#password').type(password);
      find('#allow').click();

      // Mysteriously, on some browsers, Twitter requires also
      // clicking on "Authorize App" on every sign in.
      try {
        find('#allow', 30000).click();
      } catch (e) {
        // Twitter decided not to require this step this time.  Why?
      }
    }
  },
  {
    name: 'weibo',
    userDisplayName: 'AuthMeteor',
    waitForPopupContents: function () {
      expect(find('p.oauth_main_info', 30000).text()).to.contain("meteor_auth_qa");
    },
    signInInPopup: function () {
      find('#userId').type(email);
      find('#passwd').type(password);
      find('a[action-type=submit]').click();
    }
  },
  {
    name: 'meteor-developer',
    userDisplayName: 'meteorauthqa',
    waitForPopupContents: function () {
      expect(find('div.header', 30000).text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      find('input[name=usernameOrEmail]').type(email);
      find('input[name=password]').type(password);
      find('input[type=submit]').click();
    },
    signInInSecondPopup: function () {
      find('a.login-with-account').click(); // "Use this account"
    }
  },
  {
    name: 'meetup',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect(find('#paneLogin', 30000).text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      find('#email').type(email);
      find('#password').type(password);
      find('input[type=submit]').click();
    }
  }
];
