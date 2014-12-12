// Monkey-patching Email.send to log all emails sent.
// We are displaying these in the client so we can assert the results with
// selenium tests.
Email.send = function (options) {
  EmailFlowLogs.insert(options);
};