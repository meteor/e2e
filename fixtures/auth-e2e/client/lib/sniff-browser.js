var sniffBrowserId = function () {
  var UA = navigator.userAgent;
  if (UA.match(/Android/)) return 'android';
  if (UA.match(/Chrome/)) return 'chrome';
  if (UA.match(/Firefox/)) return 'firefox';
  if (UA.match(/Safari/)) return 'safari';
  var ie = UA.match(/MSIE\s(\d+)/) || UA.match(/Trident.*rv:(\d+)/);
  if (ie) {
    return 'ie' + ie[1];
  }
  return 'unknown';
};

// store the browser test account in session, so we can use it to
// filter email flow logs.
Session.set('browser', sniffBrowserId());

// Remove the associated test account before tests, so we can repeat
// the tests on a reload without having to re-deploy everytime.
Meteor.call('removeTestAccount', Session.get('browser'));

// clear all email logs associated with this browser
Meteor.call('clearEmailLogs', Session.get('browser'));

// Generate a browserId so that testers using different browsers
// create different user accounts (avoid clashing)
Template.body.helpers({
  browserId: sniffBrowserId
});