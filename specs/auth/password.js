describe('Password based login', function () {

  // use a browser-specific email here to ensure each browser creates
  // a different test account. this is retrieved during the test and
  // reused in multiple specs.
  var browserTestAccount;

  it('should display correct UI elements', function () {
    browser.get('http://rainforest-auth-qa.meteor.com');
    find('#login-sign-in-link').click();
    browser.waitFor([
      '#login-email-label',
      '#login-email',
      '#login-password-label',
      '#login-password',
      '#login-buttons-password',
      '#signup-link',
      '#forgot-password-link'
    ]);
  });

  it('should show correct error message for invalid email', function () {
    find('#login-buttons-password').click();
    expect(find('.message.error-message').text()).to.contain('Invalid email');
  });

  it('should show correct error message when user is not found', function () {
    find('#login-email').type('foo@bar.com');
    find('#login-password').type('12345');
    find('#login-buttons-password').click();
    expect(find('.message.error-message').text()).to.contain('User not found');
  });

  it('should require at least 6 characters for password', function () {
    find('#signup-link').click();
    browserTestAccount = find('#browser-email').text();
    find('#login-email').clear().type(browserTestAccount);
    find('#login-buttons-password').click();
    expect(find('.message.error-message').text())
      .to.contain('Password must be at least 6 characters long');
  });

  it('should sign in after successfully creating a new account', function () {
    find('#login-password').clear().type('123456');
    find('#login-buttons-password').click();
    expect(find('#login-name-link').text()).to.contain(browserTestAccount);
  });

  it('should be able to sign out', function () {
    find('#login-name-link').click();
    find('#login-buttons-logout').click();
    expect(find('#login-sign-in-link').text()).to.contain('Sign in ▾');
  });

  it('should show correct error message for incorrect password', function () {
    find('#login-sign-in-link').click();
    find('#login-email').type(browserTestAccount);
    find('#login-password').type('654321');
    find('#login-buttons-password').click();
    expect(find('.message.error-message').text()).to.contain('Incorrect password');
  });

  it('should be able to sign in after signing out', function () {
    find('#login-password').clear().type('123456');
    find('#login-buttons-password').click();
    expect(find('#login-name-link').text()).to.contain(browserTestAccount);
  });

  it('should be able to change password', function () {
    find('#login-name-link').click();
    find('#login-buttons-open-change-password').click();
    find('#login-old-password').type('123456');
    find('#login-password').type('654321');
    find('#login-buttons-do-change-password').click();
    expect(find('.message.info-message').text()).to.contain('Password changed');
  });

  it('should be able to sign with changed password', function () {
    //sign out
    find('.login-close-text').click();
    find('#login-name-link').click();
    find('#login-buttons-logout').click();
    expect(find('#login-sign-in-link').text()).to.contain('Sign in ▾');
    // sign in again
    find('#login-sign-in-link').click();
    find('#login-email').type(browserTestAccount);
    find('#login-password').type('654321');
    find('#login-buttons-password').click();
    expect(find('#login-name-link').text()).to.contain(browserTestAccount);
  });

  it('should show correct error message when creating an account that already exists', function () {
    //sign out
    find('#login-name-link').click();
    find('#login-buttons-logout').click();
    expect(find('#login-sign-in-link').text()).to.contain('Sign in ▾');
    // try to create existing account
    find('#login-sign-in-link').click();
    find('#signup-link').click();
    find('#login-email').type(browserTestAccount);
    find('#login-password').type('123456');
    find('#login-buttons-password').click();
    expect(find('.message.error-message').text())
      .to.contain('Email already exists');
  });

  it('should show correct custom error message thrown in validateNewUser()', function () {
    find('#login-email').clear().type('invalid@qa.com');
    find('#login-buttons-password').click();
    expect(find('.message.error-message').text())
      .to.contain('Invalid email address');
  });

});