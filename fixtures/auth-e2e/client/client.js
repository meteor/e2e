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

// Generate a browserId so that testers using different browsers
// create different user accounts (avoid clashing)
Template.body.helpers({
  browserId: sniffBrowserId
});

// Remove the associated test account before tests, just to be safe
Meteor.call('removeTestAccount', sniffBrowserId());