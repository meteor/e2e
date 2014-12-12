// Monkey-patching Email.send to log all emails sent.
// We are displaying these in the client so we can assert the results with
// selenium tests.
Email.send = function (options) {
  options.time = new Date().toString();
  EmailFlowLogs.insert(options);
};

Meteor.methods({
  
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