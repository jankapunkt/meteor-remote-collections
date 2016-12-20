// Import Tinytest from the tinytest Meteor package.
// meteor test-packages jkuester:remote-collections
import {Tinytest} from "meteor/tinytest";

// Import and rename a variable exported by remote-collections.js.
import {RemoteCollections} from "meteor/jkuester:remote-collections";


//------------------------------------------------------------------//
//  GLOBAL USAGE AMONG ALL TESTS
//------------------------------------------------------------------//
//NOTE: Make sure you a second application with the specific methods
// running on the specific port.

const CURRENT_CONNECTION_ID = "tinytest-current-connection";
const CURRENT_CONNECTION_URL = "http://localhost:3030";

const CURRENT_REMOTE_LOAD_METHOD =      'RemoteProvider.getPrivateDatabases';
const CURRENT_REMOTE_SUBSCRIBE_METHOD = "RemoteProvider.getAvailableSubscriptions";
const HAS_REMOTE_COLLECTIONS_PROVIDER = "RemoteProvider.hasRemoteCollectionsProvider";

const EXPECTED_COLLECTION_NAME = "tests";



const observe = {
    added: function (item) {
        //console.log('-- remote item added--');
        //console.log(item);
        //GLOBAL_TEST_OBJ.isNotNull(item);
    },

    removed: function (item) {
        //console.log('-- remote items removed--');
        //console.log(item);
        //GLOBAL_TEST_OBJ.isNotNull(item);
    }
};

//------------------------------------------------------------------//
//  STARTUP SETTINGS
//------------------------------------------------------------------//

Meteor.startup(() => {

    Tinytest.add('remote-collections - subscriptions', function (test) {

        const results = RemoteCollections.loadRemoteSubscriptions({id: CURRENT_CONNECTION_ID, method: CURRENT_REMOTE_SUBSCRIBE_METHOD });
        testExists(test, results, "results");
        test.equal(results[CURRENT_CONNECTION_ID], true);

        const subscriptions = RemoteCollections.getSubscriptionsById(CURRENT_CONNECTION_ID);
        testExists(test, subscriptions, "subscriptions");

        const collections = RemoteCollections.getCollections();
        testExists(test, collections, "collections");

        const collectionsNames =  Object.keys(collections);
        test.equal(collectionsNames.length, 1);

        const currentCollectionName = collectionsNames[0];
        testExists(test, currentCollectionName, "currentCollectionName");
        test.equal(currentCollectionName, EXPECTED_COLLECTION_NAME);

        const currentCollection = collections[EXPECTED_COLLECTION_NAME];
        testExists(test, currentCollection, "currentCollection");
        test.notEqual(currentCollection.hasOwnProperty('find'), true);

        const found = currentCollection.find({});
        testExists(test,found, "found");
        //test.notEqual(found.count(), 0); //TODO why is 0 here? Items are added though...
    });


});



Tinytest.add('remote-collections - import not null', function (test) {
    //importing a fresh RemoteCollections class
    testExists(test, RemoteCollections, "RemoteCollections");
    RemoteCollections.setDebug(true);
});

Tinytest.add('remote-collections - initial status', function (test) {
    const initialRemoteCollections = RemoteCollections.getCollections();
    testObjectHasChildren(test, initialRemoteCollections, 0);
    test.equal(initialRemoteCollections, {}), "initial collection is not empty";
});


Tinytest.add('remote-collections - create single remote ddp connections', function (test) {

    RemoteCollections.addDDPConnectionURL(CURRENT_CONNECTION_ID, CURRENT_CONNECTION_URL);
    const connection = RemoteCollections.getDDPConnection(CURRENT_CONNECTION_ID);
    testExists(test, connection, "connection");

    const allConnections = RemoteCollections.getAllDDPConnections();
    testObjectHasChildren(test, allConnections, 1);

});

Tinytest.add('remote-collections - load single collection', function (test) {
    RemoteCollections.loadRemoteCollections({id:CURRENT_CONNECTION_ID, method:CURRENT_REMOTE_LOAD_METHOD, observe:observe});
    const collections = RemoteCollections.getCollections();
    testExists(test, collections, "collections");

    const collectionsNames =  Object.keys(collections);
    test.equal(collectionsNames.length, 1, "unexpected collection length: ");

    const currentCollectionName = collectionsNames[0];
    testExists(test, currentCollectionName, "currentCollectionName");
    test.equal(currentCollectionName, EXPECTED_COLLECTION_NAME);

    const currentCollection = collections[EXPECTED_COLLECTION_NAME];
    testExists(test, currentCollection, "currentCollection");
    test.notEqual(currentCollection.hasOwnProperty('find'), true);

    const found = currentCollection.find({});
    testExists(test,found, "found");
});



function testExists(test, obj, optionalName){
    if (!optionalName)
        optionalName = "";
    test.isNotNull(obj, "unexpected object is null ("+optionalName+")");
    test.isNotUndefined(obj, "unexpected: object is undefined ("+optionalName+")");
}

function testObjectHasChildren(test, obj, expectedChildCount){
    testExists(test, obj);
    const keys = Object.keys(obj);
    testExists(test, keys);
    test.equal(keys.length, expectedChildCount, "unexpected: childcount is " + keys.length+", expected is "+expectedChildCount);
}