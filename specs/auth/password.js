describe('Password based login', function () {

  // use a browser-specific email here to ensure each browser creates
  // a different test account. this is retrieved during the test and
  // reused in multiple specs.
  var browserTestAccount;

  it('should display correct UI elements', function () {
    browser.get('http://rainforest-auth-qa.meteor.com');
    $('#login-sign-in-link').click();
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
    $('#login-buttons-password').click();
    expect($('.message.error-message').text()).to.contain('Invalid email');
  });

  it('should show correct error message when user is not found', function () {
    $('#login-email').type('foo@bar.com');
    $('#login-password').type('12345');
    $('#login-buttons-password').click();
    expect($('.message.error-message').text()).to.contain('User not found');
  });

  it('should require at least 6 characters for password', function () {
    $('#signup-link').click();
    browserTestAccount = $('#browser-email').text();
    $('#login-email').clear().type(browserTestAccount);
    $('#login-buttons-password').click();
    expect($('.message.error-message').text())
      .to.contain('Password must be at least 6 characters long');
  });

  it('should sign in after successfully creating a new account', function () {
    $('#login-password').clear().type('123456');
    $('#login-buttons-password').click();
    expect($('#login-name-link').text()).to.contain(browserTestAccount);
  });

  it('should be able to sign out', function () {
    $('#login-name-link').click();
    $('#login-buttons-logout').click();
    expect($('#login-sign-in-link').text()).to.contain('Sign in ▾');
  });

  it('should show correct error message for incorrect password', function () {
    $('#login-sign-in-link').click();
    $('#login-email').type(browserTestAccount);
    $('#login-password').type('654321');
    $('#login-buttons-password').click();
    expect($('.message.error-message').text()).to.contain('Incorrect password');
  });

  it('should be able to sign in after signing out', function () {
    $('#login-password').clear().type('123456');
    $('#login-buttons-password').click();
    expect($('#login-name-link').text()).to.contain(browserTestAccount);
  });

  it('should be able to change password', function () {
    $('#login-name-link').click();
    $('#login-buttons-open-change-password').click();
    $('#login-old-password').type('123456');
    $('#login-password').type('654321');
    $('#login-buttons-do-change-password').click();
    expect($('.message.info-message').text()).to.contain('Password changed');
  });

  it('should be able to sign with changed password', function () {
    //sign out
    $('.login-close-text').click();
    $('#login-name-link').click();
    $('#login-buttons-logout').click();
    expect($('#login-sign-in-link').text()).to.contain('Sign in ▾');
    // sign in again
    $('#login-sign-in-link').click();
    $('#login-email').type(browserTestAccount);
    $('#login-password').type('654321');
    $('#login-buttons-password').click();
    expect($('#login-name-link').text()).to.contain(browserTestAccount);
  });

  it('should show correct error message when creating an account that already exists', function () {
    //sign out
    $('#login-name-link').click();
    $('#login-buttons-logout').click();
    expect($('#login-sign-in-link').text()).to.contain('Sign in ▾');
    // try to create existing account
    $('#login-sign-in-link').click();
    $('#signup-link').click();
    $('#login-email').type(browserTestAccount);
    $('#login-password').type('123456');
    $('#login-buttons-password').click();
    expect($('.message.error-message').text())
      .to.contain('Email already exists');
  });

  it('should show correct custom error message thrown in validateNewUser()', function () {
    $('#login-email').clear().type('invalid@qa.com');
    $('#login-buttons-password').click();
    expect($('.message.error-message').text())
      .to.contain('Invalid email address');
  });

});