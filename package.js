Package.describe({
  name: 'jkuester:remote-collections',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Loads remote collections and subscribes via ddp. Allows multiple connections.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2.3');
  api.use('ecmascript');
  api.mainModule('remote-collections.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('remote-collections');
  api.mainModule('remote-collections-tests.js');
});
