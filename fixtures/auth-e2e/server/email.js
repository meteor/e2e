// Monkey-patching Email.send to log all emails sent.
// We are displaying these in the client so we can assert the results with
// selenium tests.
Email.send = function (options) {
  options.time = new Date().toString();
  options.timestamp = Date.now();
  EmailFlowLogs.insert(options);
};

Meteor.startup(function () {
  
  // clear ALL email logs
  EmailFlowLogs.remove({});

  // create a common test account used in email flows
  // (the account to login with in the second window)
  try {
    Accounts.createUser({
      email: 'email@qa.com',
      password: '123456'
    });
  } catch (e) {}

  // send verification email
  Accounts.config({
    sendVerificationEmail: true
  });

});