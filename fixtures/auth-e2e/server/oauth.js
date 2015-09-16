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

  var loginStyle = secrets.loginStyle || 'popup';

  // intentionally calling the configureLoginService method
  // here instead of direct insert, since this is the method
  // being called on the server when an actual user configures it.
  Meteor.call('configureLoginService', {
    service: "facebook",
    appId: "461508060653790",
    secret: secret("facebook"),
    loginStyle: loginStyle
  });
  Meteor.call('configureLoginService', {
    service: "google",
    clientId: "262689297883-d14f2erj5dlfhk6nlvhcldhq0624op7q.apps.googleusercontent.com",
    secret: secret("google"),
    loginStyle: loginStyle
  });
  Meteor.call('configureLoginService', {
    service: "twitter",
    consumerKey: "0eRD2Z28NjAMjQGeqFXM8MMY5",
    secret: secret("twitter"),
    loginStyle: loginStyle
  });
  Meteor.call('configureLoginService', {
    service: "github",
    clientId: "d4b54e5ba3611bc14c06",
    secret: secret("github"),
    loginStyle: loginStyle
  });
  Meteor.call('configureLoginService', {
    service: "weibo",
    clientId: "819563028",
    secret: secret("weibo"),
    loginStyle: loginStyle
  });
  Meteor.call('configureLoginService', {
    service: "meetup",
    clientId: "mvnukfi6bdoacs03tkirj4394n",
    secret: secret("meetup"),
    loginStyle: loginStyle
  });
  Meteor.call('configureLoginService', {
    service: "meteor-developer",
    clientId: "u6q4sghbCdyCtkTpr",
    secret: secret("meteor-developer"),
    loginStyle: loginStyle
  });

});
