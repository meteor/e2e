var chalk = require('chalk');
var providers = [
  'github',
  'google',
  'facebook',
  'twitter',
  'weibo',
  'meteor-developer',
  'meetup'
];
var providerRegex = new RegExp(providers.join('|'));
var failedPairs = {};

exports.fail = function (browser, message) {
  var providerMatch = message.match(providerRegex);
  if (providerMatch) {
    var provider = providerMatch[0];
    if (!failedPairs[browser]) {
      failedPairs[browser] = {};
    }
    failedPairs[browser][provider] = true;
  }
};

exports.reportFailedPairs = function () {
  if (!Object.keys(failedPairs).length) {
    return;
  }
  console.log(chalk.red('Failed browser/OAuth provider pairs:\n'));
  var browser, provider;
  for (browser in failedPairs) {
    for (provider in failedPairs[browser]) {
      console.log(chalk.red('- ' + browser + '/' + provider));
    }
  }
  console.log();
};