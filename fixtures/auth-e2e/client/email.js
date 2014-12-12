Session.set('actionSuccess', false);

Template.emailLogs.helpers({
  
  logs: function () {
    return EmailFlowLogs.find({
      to: Session.get('browser') + '@qa.com'
    }, { sort: { timestamp: -1 }});
  },

  actionSuccess: function () {
    return Session.get('actionSuccess');
  }

});

Template.emailLogs.events({

  'click #clear-email-logs': function () {
    Session.set('actionSuccess', false);
    Meteor.call('clearEmailLogs', Session.get('browser'), function () {
      Session.set('actionSuccess', true);
    });
  },

  'click #create-test-account': function () {
    Session.set('actionSuccess', false);
    Meteor.call('createTestAccount', Session.get('browser'), function () {
      Session.set('actionSuccess', true);
    });
  },

  'click #delete-test-account': function () {
    Session.set('actionSuccess', false);
    Meteor.call('removeTestAccount', Session.get('browser'), function () {
      Session.set('actionSuccess', true);
    });
  },

  'click #test-send-enrollment-email': function () {
    Meteor.call('sendNewVerificationEmail', Session.get('browser'));
  }

});