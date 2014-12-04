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
      expect($('#login').text()).to.contain("Sign in");
    },
    signInInPopup: function () {
      $('#login_field').type(email);
      $('#password').type(password);
      $('input[name=commit]').click();
    }
  },
  {
    name: 'google',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect($('h2').text()).to.contain("Sign in with your Google Account");
    },
    signInInPopup: function () {
      $('#Email').type(email);
      $('#Passwd').type(password);
      $('input[name=signIn]').click();
    }
  },
  {
    name: 'facebook',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect($('#login_form').text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      $('#email').type(email);
      $('#pass').type(password);
      $('input[name=login]').click();
    }
  },
  {
    name: 'twitter',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect($('div.auth').text()).to.contain("Authorize Meteor Auth QA");
    },
    signInInPopup: function () {
      $('#username_or_email').type(email);
      $('#password').type(password);
      $('#allow').click();
    }
  },
  {
    name: 'weibo',
    userDisplayName: 'AuthMeteor',
    waitForPopupContents: function () {
      expect($('p.oauth_main_info').text()).to.contain("meteor_auth_qa");
    },
    signInInPopup: function () {
      $('#userId').type(email);
      $('#passwd').type(password);
      $('a[action-type=submit]').click();
    }
  },
  {
    name: 'meteor-developer',
    userDisplayName: 'meteorauthqa',
    waitForPopupContents: function () {
      expect($('div.header').text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      $('input[name=usernameOrEmail]').type(email);
      $('input[name=password]').type(password);
      $('input[type=submit]').click();
    },
    signInInSecondPopup: function () {
      $('a.login-with-account').click(); // "Use this account"
    }
  },
  {
    name: 'meetup',
    userDisplayName: 'Auth Meteor',
    waitForPopupContents: function () {
      expect($('#paneLogin').text()).to.contain("Meteor Auth QA");
    },
    signInInPopup: function () {
      $('#email').type(email);
      $('#password').type(password);
      $('input[type=submit]').click();
    }
  }
];
