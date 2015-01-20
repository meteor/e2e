var _ = require('underscore');
var chalk = require('chalk');

// Maps browserName -> array of lines, to be displayed in a very
// visible banner at the bottom of the run in case of failure.
var messages = {};

exports.record = function (browser, msg) {
  if (!messages[browser])
    messages[browser] = [];
  messages[browser].push(msg);
};

// print a red error line
var line = function (msg) {
  console.log(chalk.red(msg));
};

exports.print = function () {
  if (_.isEmpty(messages))
    return;

  line("****************************************************************************");
  line("*** FAILURE SUMMARY                                                         ");
  line("***                                                                         ");
  line("*** Here is a summary of the failures, with some links to help you diagnose.");
  line("***                                                                         ");

  for (browser in messages) {
    line("*** (" + browser + ")");
    _.each(messages[browser], function (msg) {
      line("*** => " + msg);
    });
    line("***");
  };

  line("****************************************************************************");
};
