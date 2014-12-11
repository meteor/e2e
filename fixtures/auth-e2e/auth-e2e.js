if (Meteor.isServer) {
  Meteor.methods({
    // remove all existing users
    removeTestAccount: function (email) {
      Meteor.users.remove({
        'emails.0.address': email + '@qa.com'
      });
    }
  });
  Meteor.startup(function () {
    // configure services
    ServiceConfiguration.configurations.remove({
      service: {
        $in: [
          'facebook',
          'google',
          'twitter',
          'github',
          'meetup',
          'meteor-developer',
          'weibo'
        ]
      }
    });

    var secrets = Meteor.settings;
    var secret = function (provider) {
      if (!secrets[provider]) {
        console.error("Need to set `Meteor.settings[\"" + provider + "\"]`");
        process.exit(1);
      };
      return secrets[provider];
    };

    // intentionally calling the configureLoginService method
    // here instead of direct insert, since this is the method
    // being called on the server when an actual user configures it.
    Meteor.call('configureLoginService', {
      service: "facebook",
      appId: "461508060653790",
      secret: secret("facebook"),
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "google",
      clientId: "262689297883-d14f2erj5dlfhk6nlvhcldhq0624op7q.apps.googleusercontent.com",
      secret: secret("google"),
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "twitter",
      consumerKey: "0eRD2Z28NjAMjQGeqFXM8MMY5",
      secret: secret("twitter"),
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "github",
      clientId: "d4b54e5ba3611bc14c06",
      secret: secret("github"),
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "weibo",
      clientId: "819563028",
      secret: secret("weibo"),
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "meetup",
      clientId: "mvnukfi6bdoacs03tkirj4394n",
      secret: secret("meetup"),
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "meteor-developer",
      clientId: "u6q4sghbCdyCtkTpr",
      secret: secret("meteor-developer"),
      loginStyle: "popup"
    });
    // validate user
    Accounts.validateNewUser(function (user) {
      if (user.emails && user.emails[0].address === 'invalid@qa.com') {
        throw new Meteor.Error(403, "Invalid email address");
      } else if (user.emails && user.emails[0].address === 'foo@bar.com') {
        throw new Meteor.Error(403, "You shouldn't be actually creating foo@bar.com in this test.");
      } else {
        return true;
      }
    });
  });
}

if (Meteor.isClient) {
  BrowserErrors = new Meteor.Collection(null);
  window.onerror = function (msg, url, line) {
    BrowserErrors.insert({msg: msg, url: url, line: line});
  };
  var sniffBrowserId = function () {
    var UA = navigator.userAgent;
    if (UA.match(/Android/)) return 'android';
    if (UA.match(/Chrome/)) return 'chrome';
    if (UA.match(/Firefox/)) return 'firefox';
    var ie = UA.match(/MSIE\s(\d+)/) || UA.match(/Trident.*rv:(\d+)/);
    if (ie) {
      return 'ie' + ie[1];
    }
    return 'unknown';
  };
  // Generate a browserId so that testers using different browsers
  // create different user accounts (avoid clashing)
  Template.body.helpers({
    browserId: sniffBrowserId,
    browserErrors: function () { return BrowserErrors.find().fetch(); }
  });
  Meteor.call('removeTestAccount', sniffBrowserId());
}
