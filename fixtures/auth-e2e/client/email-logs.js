Template.emailLogs.helpers({
  logs: function () {
    return EmailFlowLogs.find({
      to: Session.get('testAccount')
    });
  }
});