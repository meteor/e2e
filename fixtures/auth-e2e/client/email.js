Template.emailLogs.helpers({
  logs: function () {
    return EmailFlowLogs.find({
      to: Session.get('browser') + '@qa.com'
    }, { sort: { timestamp: -1 }});
  }
});