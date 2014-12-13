Template.actions.helpers({
  actionSuccess: function () {
    return Session.get('actionSuccess');
  }
});

Session.set('actionSuccess', false);

// return a function that calls the given method
// and set the success flag
function makeAction (method) {
  return function () {
    Session.set('actionSuccess', false);
    Meteor.call(method, Session.get('browser'), function () {
      Session.set('actionSuccess', true);
    });
  }
}

Template.actions.events({
  'click #clear-email-logs'           : makeAction('clearEmailLogs'),
  'click #create-test-account'        : makeAction('createTestAccount'),
  'click #remove-test-account'        : makeAction('removeTestAccount'),
  'click #test-send-enrollment-email' : makeAction('sendNewVerificationEmail')
});