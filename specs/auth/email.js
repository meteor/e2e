var browserTestAccount;
var testURL = 'localhost:3000';
// var testURL = 'rainforest-auth-qa.meteor.com';
var emailLinkRegex = new RegExp('http:\\/\\/' + testURL + '\\/#\\/[a-zA-z-_\\d\\/]+');

// assert content on the first email in the list
var assertEmail = function (options) {
  for (var key in options) {
    expect(find('.email-log:first-child .email-' + key, 30000).text())
      .to.contain(options[key]);
  }
};

// open a new window, and login with a different test account
var openNewWindowAndLogin = function () {
  browser.newWindow('http://' + testURL);
  browser.focusSecondWindow();
  find('#login-sign-in-link', 30000).click();
  find('#login-email').type('email@qa.com');
  find('#login-password').type('123456');
  find('#login-buttons-password').click();
  expect(find('#login-name-link', 30000).text()).to.contain('email@qa.com');
  browser.focusMainWindow();
};

// go to the linked found in the top-most email
var goToLinkInEmail = function () {
  var text = find('.email-log:first-child .email-text').text();
  var match = text.match(emailLinkRegex);
  expect(match).to.exist;
  browser.get(match[0]);
  browser.refresh(); // force reload because it's a hash link
};

describe('Auth Email -', function () {

  before(function () {
    browser.get('http://' + testURL);
    waitFor('#email-logs', 30000);
    // cache browser test account
    browserTestAccount = find('#browser-email').text();
    // clear email logs before we start the test
    find('#clear-email-logs').click();
    waitFor('#server-action-ok', 30000);
    expect(count('.email-log')).to.equal(0);
  });

  describe('Forgot Password', function () {

    it('should send correct email', function () {
      find('#create-test-account').click();
      waitFor('#server-action-ok', 30000);
      find('#login-sign-in-link').click();
      find('#forgot-password-link').click();
      find('#forgot-password-email').type(browserTestAccount);
      find('#login-buttons-forgot-password').click();
      expect(find('.message.info-message', 3000).text())
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
      expect(find('#login-sign-in-link', 30000).text()).to.contain('Sign in ▾');
    });

    it('should log in after resetting the password', function () {
      find('#reset-password-new-password').type('654321');
      find('#login-buttons-reset-password-button').click();
      // expect logged in
      expect(find('#login-name-link', 30000).text())
        .to.contain(browserTestAccount);
      expect(find('.accounts-dialog').text())
        .to.contain('Password reset. You are now logged in as ' + browserTestAccount);
    });

    // it('should transfer the login to another tab', function () {
    //   browser.focusSecondWindow();
    //   expect(find('#login-name-link', 30000).text())
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
      find('#login-name-link', 30000).click();
      find('#login-buttons-logout').click();
      expect(find('#login-sign-in-link', 30000).text()).to.contain('Sign in ▾');
    });

    it('should send correct email', function () {
      find('#test-send-enrollment-email').click();
      waitFor('#server-action-ok', 30000);
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
      expect(find('#login-sign-in-link', 30000).text()).to.contain('Sign in ▾');
    });

    it('should be able to log in after resetting password', function () {
      find('#enroll-account-password').type('123456');
      find('#login-buttons-enroll-account-button').click();
      // expect logged in
      expect(find('#login-name-link', 30000).text())
        .to.contain(browserTestAccount);
    });

    // it('should transfer the login to another tab', function () {
    //   browser.focusSecondWindow();
    //   expect(find('#login-name-link', 30000).text())
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