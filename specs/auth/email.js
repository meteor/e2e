describe('Auth Email -', function () {

  var browserTestAccount;
  // var testURL = 'localhost:3000';
  var testURL = 'rainforest-auth-qa.meteor.com';
  var emailLinkRegex = new RegExp('http:\\/\\/' + testURL + '\\/#\\/[a-zA-z-_\\d\\/]+');

  // assert content on the first email in the list
  var assertEmail = function (options) {
    for (var key in options) {
      expect(find('.email-log:first-child .email-' + key).text())
        .to.contain(options[key]);
    }
  };

  // open a new window, and login with a different test account
  var openNewWindowAndLogin = function () {
    browser.newWindow('http://' + testURL);
    browser.focusSecondWindow();
    find('#login-sign-in-link').click();
    find('#login-email').type('email@qa.com');
    find('#login-password').type('123456');
    find('#login-buttons-password').click();
    expect(find('#login-name-link').text()).to.contain('email@qa.com');
    browser.focusMainWindow();
  };

  var getLinkFromEmail = function () {
    var text = find('.email-log:first-child .email-text').text();
    var match = text.match(emailLinkRegex);
    expect(match).to.exist;
    return match[0];
  };

  before(function () {
    browser.get('http://' + testURL);
    waitFor('#email-logs');
    browserTestAccount = find('#browser-email').text();
    // clear email logs before we start the test
    find('#clear-email-logs').click();
    waitFor('#server-action-ok');
  });

  describe('Accounts.sendEnrollmentEmail', function () {

    it('should send correct email', function () {
      expect(count('.email-log')).to.equal(0);
      find('#test-send-enrollment-email').click();
      waitFor('.email-log');
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
      var link = getLinkFromEmail();
      browser.get(link);
      browser.refresh(); // force reload because it's a hash link
      expect(find('#login-sign-in-link').text()).to.contain('Sign in ▾');
      find('#enroll-account-password').type('123456');
      find('#login-buttons-enroll-account-button').click();
      // currently shows "Token expired"
    });

    // it('should be able to log in after resetting password', function () {
      
    // });

    // it('login status should persist acroos windows', function () {
      
    // });

  });

});