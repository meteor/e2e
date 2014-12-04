var Fiber = require('fibers');
var Future = require('fibers/future');
var _ = require('underscore');

// Adapted from METEOR/packages/meteor/helpers.js:Meteor.wrapAsync
exports.wrapAsync = function (fn, context) {
  return function (/* arguments */) {
    var self = context || this;
    var newArgs = _.toArray(arguments);
    var callback;
    var fut;

    for (var i = newArgs.length - 1; i >= 0; --i) {
      var arg = newArgs[i];
      var type = typeof arg;
      if (type !== 'undefined') {
        if (type === 'function') {
          callback = arg;
        }
        break;
      }
    }

    if (! callback) {
      fut = new Future();
      callback = fut.resolver();
      ++i; // Insert the callback just after arg.
    }

    newArgs[i] = function () {
      var args = arguments;
      Fiber(function () {
        callback.apply(null, args);
      }).run();
    };
    var result = fn.apply(self, newArgs);
    return (fut ? fut.wait() : result) || self;
  };
};

// Given a list of method names, wrap each of them
// with `wrapAsync`, letting you call them synchronously
// or asynchronously.
//
// XXX there's probably a better way to do this.
// but an experiment wrapping all methods on `obj`
// let to a failing test.
exports.wrapAsyncObject = function (obj, methods) {
  _.each(methods, function (method) {
    obj[method] = exports.wrapAsync(obj[method], obj);
  });
  return obj;
};