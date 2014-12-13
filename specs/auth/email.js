var browserTestAccount;
// var testURL = 'localhost:3000';
var testURL = 'rainforest-auth-qa.meteor.com';
var emailLinkRegex = new RegExp('http:\\/\\/' + testURL + '\\/#\\/[a-zA-z-_\\d\\/]+');

// assert content on the first email in the list
var assertEmail = function (options) {
  for (var key in options) {
    expect(browser.find('.email-log:first-child .email-' + key, 30000).text())
      .to.contain(options[key]);
  }
};

// open a new window, and login with a different test account
var openNewWindowAndLogin = function () {
  browser.newWindow('http://' + testURL);
  browser.focusSecondWindow();
  browser.find('#login-sign-in-link', 30000).click();
  browser.find('#login-email').type('email@qa.com');
  browser.find('#login-password').type('123456');
  browser.find('#login-buttons-password').click();
  expect(browser.find('#login-name-link', 30000).text()).to.contain('email@qa.com');
  browser.focusMainWindow();
};

// go to the linked found in the top-most email
var goToLinkInEmail = function () {
  var text = browser.find('.email-log:first-child .email-text').text();
  var match = text.match(emailLinkRegex);
  expect(match).to.exist;
  browser.get(match[0]);
  browser.refresh(); // force reload because it's a hash link
};

describe('Auth Email -', function () {

  before(function () {
    browser.get('http://' + testURL);
    browser.wait('#email-logs', 30000);
    // cache browser test account
    browserTestAccount = browser.find('#browser-email').text();
    // clear email logs before we start the test
    browser.find('#clear-email-logs').click();
    browser.wait('#server-action-ok', 30000);
    expect(browser.count('.email-log')).to.equal(0);
  });

  describe('Forgot Password', function () {

    it('should send correct email', function () {
      browser.find('#create-test-account').click();
      browser.wait('#server-action-ok', 30000);
      browser.find('#login-sign-in-link').click();
      browser.find('#forgot-password-link').click();
      browser.find('#forgot-password-email').type(browserTestAccount);
      browser.find('#login-buttons-forgot-password').click();
      expect(browser.find('.message.info-message', 3000).text())
        .to.contain('Email sent');
      assertEmail({
        from: 'Meteor Accounts <no-reply@meteor.com>',
        to: browserTestAccount,
        subject: 'How to reset your password on ' + testURL,
        text: 'Hello, To reset your password, simply click the link below. ' +
          'http://' + testURL + '/#/reset-password/'
      });
    });

    it('should not be logged in when following the email link', function () {
      openNewWindowAndLogin();
      goToLinkInEmail();
      expect(browser.find('#login-sign-in-link', 30000).text()).to.contain('Sign in ▾');
    });

    it('should log in after resetting the password', function () {
      browser.find('#reset-password-new-password').type('654321');
      browser.find('#login-buttons-reset-password-button').click();
      // expect logged in
      expect(browser.find('#login-name-link', 30000).text())
        .to.contain(browserTestAccount);
      expect(browser.find('.accounts-dialog').text())
        .to.contain('Password reset. You are now logged in as ' + browserTestAccount);
    });

    // it('should transfer the login to another tab', function () {
    //   browser.focusSecondWindow();
    //   expect(browser.find('#login-name-link').text())
    //     .to.contain(browserTestAccount);
    // });

    after(function () {
      // cloase second tab
      browser.focusSecondWindow();
      browser.close();
      browser.focusMainWindow();
    });

  });

  describe('Accounts.sendEnrollmentEmail', function () {

    before(function () {
      browser.refresh();
      // log out first
      browser.find('#login-name-link', 30000).click();
      browser.find('#login-buttons-logout').click();
      expect(browser.find('#login-sign-in-link', 30000).text()).to.contain('Sign in ▾');
    });

    it('should send correct email', function () {
      browser.find('#test-send-enrollment-email').click();
      browser.wait('#server-action-ok', 30000);
      assertEmail({
        from: 'Meteor Accounts <no-reply@meteor.com>',
        to: browserTestAccount,
        subject: 'An account has been created for you on ' + testURL,
        text: 'Hello, To start using the service, simply click the link below. ' +
          'http://' + testURL + '/#/enroll-account/'
      });
    });

    it('should not be logged in when following the email link', function () {
      openNewWindowAndLogin();
      goToLinkInEmail();
      expect(browser.find('#login-sign-in-link', 30000).text()).to.contain('Sign in ▾');
    });

    it('should be able to log in after resetting password', function () {
      browser.find('#enroll-account-password').type('123456');
      browser.find('#login-buttons-enroll-account-button').click();
      // expect logged in
      expect(browser.find('#login-name-link', 30000).text())
        .to.contain(browserTestAccount);
    });

    // it('should transfer the login to another tab', function () {
    //   browser.focusSecondWindow();
    //   expect(browser.find('#login-name-link', 30000).text())
    //     .to.contain(browserTestAccount);
    // });

    after(function () {
      // cloase second tab
      browser.focusSecondWindow();
      browser.close();
      browser.focusMainWindow();
    });

  });

});