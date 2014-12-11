Meteor.methods({
  // remove a browser-specific test account.
  // this will be called from the client for every new session.
  removeTestAccount: function (email) {
    Meteor.users.remove({
      'emails.0.address': email + '@qa.com'
    });
  }
});

// test validate new user creation
Meteor.startup(function () {
  Accounts.validateNewUser(function (user) {
    if (user.emails && user.emails[0].address === 'invalid@qa.com') {
      // test custom message
      throw new Meteor.Error(403, "Invalid email address");
    } else if (user.emails && user.emails[0].address === 'foo@bar.com') {
      // this is to prevent rainforest testers accidentally creating the account
      // which would break the manual test flow.
      throw new Meteor.Error(403,
        "You shouldn't be actually creating foo@bar.com in this test.");
    } else {
      return true;
    }
  });
});