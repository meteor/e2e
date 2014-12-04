var minimist = require('minimist');
var options = minimist(process.argv.slice(2));

if (options.help) {
  console.log(require('fs').readFileSync('./usage', 'utf-8'));
  process.exit(0);
}

options.files = options._;
require('./lib/master').run(options);