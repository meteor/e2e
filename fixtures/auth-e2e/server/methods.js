Meteor.methods({
  
  // remove a browser-specific test account.
  // this will be called from the client for every new session.
  removeTestAccount: function (browser) {
    Meteor.users.remove({
      'emails.0.address': browser + '@qa.com'
    });
  },

  // convenience for additional testing
  createTestAccount: function (browser) {
    Meteor.call('removeTestAccount', browser);
    Accounts.createUser({
      email: browser + '@qa.com',
      password: '123456'
    });
  },

  clearEmailLogs: function (browser) {
    EmailFlowLogs.remove({
      to: browser + '@qa.com'
    });
  },

  sendNewVerificationEmail: function (browser) {
    Meteor.call('removeTestAccount', browser);
    var userId = Accounts.createUser({ email: browser + '@qa.com' });
    Accounts.sendEnrollmentEmail(userId);
  },

  configVerificationEmail: function (state) {
    Accounts.config({
      sendVerificationEmail: !! state
    });
  }

});