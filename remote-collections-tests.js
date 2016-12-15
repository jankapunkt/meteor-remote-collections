// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by remote-collections.js.
import { name as packageName } from "meteor/remote-collections";

// Write your tests here!
// Here is an example.
Tinytest.add('remote-collections - example', function (test) {
  test.equal(packageName, "remote-collections");
});
