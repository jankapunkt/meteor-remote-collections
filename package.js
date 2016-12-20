Package.describe({
  name: 'jkuester:remote-collections',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Loads remote collections and subscribes via ddp. Allows multiple connections.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/jankapunkt/meteor-remote-collections',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2.3');
  api.use('ecmascript');
  api.use('check');
  api.use('mongo');
  api.use('ddp-client');
  //api.use('audit-argument-checks');
  api.mainModule('remote-collections.js', ['server']);
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('check');
  api.use('mongo');
  api.use('ddp-client');
  //api.use('audit-argument-checks');
  api.use('tinytest');
  api.use('jkuester:remote-collections');
  api.mainModule('remote-collections-tests.js', 'server');
});
