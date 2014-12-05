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

    if (!process.env.OAUTH_PROVIDER_SECRETS) {
      console.error("Need to set the OAUTH_PROVIDER_SECRETS environment variable");
      process.exit(1);
    };
    var secrets = JSON.parse(process.env.OAUTH_PROVIDER_SECRETS);

    // intentionally calling the configureLoginService method
    // here instead of direct insert, since this is the method
    // being called on the server when an actual user configures it.
    Meteor.call('configureLoginService', {
      service: "facebook",
      secret: secrets.facebook,
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "google",
      clientId: "262689297883-d14f2erj5dlfhk6nlvhcldhq0624op7q.apps.googleusercontent.com",
      secret: secrets.google,
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "twitter",
      consumerKey: "0eRD2Z28NjAMjQGeqFXM8MMY5",
      secret: secrets.twitter,
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "github",
      clientId: "d4b54e5ba3611bc14c06",
      secret: secrets.github,
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "weibo",
      clientId: "819563028",
      secret: secrets.weibo,
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "meetup",
      clientId: "mvnukfi6bdoacs03tkirj4394n",
      secret: secrets.meetup,
      loginStyle: "popup"
    });
    Meteor.call('configureLoginService', {
      service: "meteor-developer",
      clientId: "u6q4sghbCdyCtkTpr",
      secret: secrets["meteor-developer"],
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
    browserId: sniffBrowserId
  });
  Meteor.call('removeTestAccount', sniffBrowserId());
}
