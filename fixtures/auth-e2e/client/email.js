Session.set('actionSuccess', false);

Template.emailLogs.helpers({
  
  logs: function () {
    return EmailFlowLogs.find({
      to: Session.get('browser') + '@qa.com'
    });
  },

  actionSuccess: function () {
    return Session.get('actionSuccess');
  }

});

Template.emailLogs.events({

  'click #create-test-account': function () {
    Session.set('actionSuccess', false);
    Meteor.call('createTestAccount', Session.get('browser'), function () {
      Session.set('actionSuccess', true);
    });
  },

  'click #delete-test-account': function () {
    Session.set('actionSuccess', false);
    Meteor.call('deleteTestAccount', Session.get('browser'), function () {
      Session.set('actionSuccess', true);
    });
  }

});