# Meteor E2E Tests

## Running Tests

```
  Usage:

    export SAUCE_LABS_ACCESS_KEY=...    # Find values in 1Password under "e2e"
    export OAUTH_PROVIDERS_PASSWORD=...
    export OAUTH_PROVIDER_SECRETS=...

    node run [files ...] [--local] [--browsers=all] [--concurrency=5] [--stack]

  Options:

    files           Files to run in `specs/`. If it's a directory, will
                    search all files recursively. Defaults to 'specs/'.

    --local         Run the tests against a local selenium server.

    --browsers      List of browsers to launch. Defaults to all browsers listed
                    in `config.js`. You can also list individual browsers like 
                    this: `--browsers=chrome,firefox`, or you can add your 
                    custom list to `exports.browserLists` in `config.js`.

    --concurrency   Maximum number of browsers to launch at the same time. The
                    default is what we have on our SauceLabs account.

    --stack         Log full error stacks.
```

## Test Authoring

All test files should be located in `specs/`. Don't place test fixtures and
helpers in there - put them in `fixtures/`. The tests are run with Mocha using a
custom interface, so each spec (the `it()` block) is run inside a fiber. We have
also wrapped methods on the wd (SauceLabs' official Node.js selenium webdriver
bridge) browser instance to let them run synchronously if you don't pass a
callback as the last argument (without blocking the event loop).

When tests are run, a wd browser instance will already be instantiated for you
and available globally as `browser`. For assertions we are using
[Chai](http://chaijs.com/api/bdd/) with `chai.expect` available globally.

The result is that your tests could look like this (isn't it nice?):

``` js
// specs/test/test_spec.js
describe('Google', function () {

  it('should have the correct title', function () {
    browser.get('http://www.google.com');
    expect(browser.title()).to.contain('Google');
  });

});
```

## Working on the Test Runner

There are several parts:

- `lib/master.js`: the master script that launches child runner processes for
  each browser we want the tests to be run against.
- `lib/test_runner.js`: a child runner process that loads Mocha and runs tests
  against a single browser. It communicates to the master script via stdout.
- `lib/test_interface.js`: a custom mocha interface that runs all tests inside
   fibers.
- `lib/test_env.js`: sets up the environment in which tests are run (globals,
  custom helpers, etc.)
- `lib/reporter.js`: where we react to test progress events emitted from child
  processes (e.g. print to console, send to server, etc.)
- `config.js`: SauceLabs credentials, browser lists, etc.

