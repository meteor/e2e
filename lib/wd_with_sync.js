// A wrapped wd with synchronous API using fibers.

var wd = require('wd');
var _ = require('underscore');
var fiberUtils = require('./fiber_utils');

var wdWithSync = _.clone(wd);

var methodsToWrap = Object.keys(require('wd/lib/commands'));

wdWithSync.remote = function () {
  var remote = wd.remote.apply(wd, arguments);

  // A fancy way to extract all of the wd commands, which map to methods
  // on `wd.remote()` that should be wrapped so that they can also be
  // called synchronously if a callback is omitted.
  fiberUtils.wrapAsyncObject(remote, Object.keys(require('wd/lib/commands')));

  // Then, wrap methods on the result of the various 'elementByXXX'
  // methods as to allow to be called synchronously if callbacks are omitted
  _.each(methodsToWrap, function (methodName) {
    if (methodName.match(/elementBy.*/)) {
      var origMethod = remote[methodName];
      remote[methodName] = function () {
        var element = origMethod.apply(this, arguments);
        // A fancy way to tell which methods on "element" objects
        // should be wrapped
        return fiberUtils.wrapAsyncObject(
          element, Object.keys(require('wd/lib/element-commands')));
      };
    }
  });
  return remote;
};

module.exports = wdWithSync;
