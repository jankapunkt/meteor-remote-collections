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

const CURRENT_REMOTE_LOAD_METHOD = 'ddp.getPrivateDatabases';
const CURRENT_REMOTE_SUBSCRIBE_METHOD = "ddp.getAvailableSubscriptions";

const EXPECTED_COLLECTION_NAME = "tests";

GLOBAL_TEST_OBJ = {};

//------------------------------------------------------------------//
//  STARTUP SETTINGS
//------------------------------------------------------------------//

Meteor.startup(() => {

    Tinytest.add('remote-collections - subscriptions', function (test) {
        const results = RemoteCollections.loadRemotSubscriptions({id: CURRENT_CONNECTION_ID, method: CURRENT_REMOTE_SUBSCRIBE_METHOD });
        testExists(test, results);
        test.equal(results[CURRENT_CONNECTION_ID], true);

        const subscriptions = RemoteCollections.getSubscriptionsById(CURRENT_CONNECTION_ID);
        testExists(test, subscriptions);


        const collections = RemoteCollections.getCollections();
        testExists(test, collections);

        const collectionsNames =  Object.keys(collections);
        test.equal(collectionsNames.length, 1);

        const currentCollectionName = collectionsNames[0];
        testExists(test, currentCollectionName);
        test.equal(currentCollectionName, EXPECTED_COLLECTION_NAME);

        const currentCollection = collections[EXPECTED_COLLECTION_NAME];
        testExists(test, currentCollection);
        test.notEqual(currentCollection.hasOwnProperty('find'), true);

        const found = currentCollection.find({});
        testExists(test,found);
        //test.notEqual(found.count(), 0); //TODO why is 0 here? Items are added though...
    });

});



Tinytest.add('remote-collections - import and initial status', function (test) {

    //importing a fresh RemoteCollections class

    testExists(test, RemoteCollections);

    const initialRemoteCollections = RemoteCollections.getCollections();
    testObjectHasChildren(test, initialRemoteCollections, 0);
    test.equal(initialRemoteCollections, {});

});


Tinytest.add('remote-collections - create single remote ddp connections', function (test) {


    RemoteCollections.addDDPConnectionURL(CURRENT_CONNECTION_ID, CURRENT_CONNECTION_URL);
    const connection = RemoteCollections.getDDPConnection(CURRENT_CONNECTION_ID);
    testExists(test, connection);

    const allConnections = RemoteCollections.getAllDDPConnections();
    testObjectHasChildren(test, allConnections, 1);

    //test.equal(connection.status().connected, true, "connection is not connected to remote " + CURRENT_CONNECTION_URL);
    //GLOBAL_TEST_OBJ = test;
    const observe = {
        added: function (item) {
            //console.log('-- remote item added--');
            //console.log(item);
            //GLOBAL_TEST_OBJ.isNotNull(item);
        }
        ,

        removed: function (item) {
            //console.log('-- remote items removed--');
            //console.log(item);
            //GLOBAL_TEST_OBJ.isNotNull(item);
        }
        ,
    };

    RemoteCollections.loadRemoteCollections({id:CURRENT_CONNECTION_ID, method:CURRENT_REMOTE_LOAD_METHOD, observe:observe});
    const collections = RemoteCollections.getCollections();
    testExists(test, collections);

    const collectionsNames =  Object.keys(collections);
    test.equal(collectionsNames.length, 1);

    const currentCollectionName = collectionsNames[0];
    testExists(test, currentCollectionName);
    test.equal(currentCollectionName, EXPECTED_COLLECTION_NAME);

    const currentCollection = collections[EXPECTED_COLLECTION_NAME];
    testExists(test, currentCollection);
    test.notEqual(currentCollection.hasOwnProperty('find'), true);

    const found = currentCollection.find({});
    testExists(test,found);

});



function testExists(test, obj){
    test.isNotNull(obj);
    test.isNotUndefined(obj);
}

function testObjectHasChildren(test, obj, expectedChildCount){
    testExists(test, obj);
    const keys = Object.keys(obj);
    testExists(test, keys);
    test.equal(keys.length, expectedChildCount);
}