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

var browser = sniffBrowserId();

// store the browser test account in session, so we can use it to
// filter email flow logs.
Session.set('browser', browser);

// Generate a browserId so that testers using different browsers
// create different user accounts (avoid clashing)
Template.body.helpers({
  browserId: function () {
    return browser;
  }
});