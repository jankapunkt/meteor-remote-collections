// Import Tinytest from the tinytest Meteor package.
// meteor test-packages jkuester:remote-collections
import {Tinytest} from "meteor/tinytest";

// Import and rename a variable exported by remote-collections.js.
import {RemoteCollections} from "meteor/jkuester:remote-collections";


//------------------------------------------------------------------//
//  GLOBAL USAGE AMONG ALL TESTS
//------------------------------------------------------------------//


const CURRENT_CONNECTION_ID = "tinytest-current-connection";
const CURRENT_CONNECTION_URL = "http://localhost:3030";

const CURRENT_REMOTE_LOAD_METHOD = 'ddp.getPrivateDatabases';
const CURRENT_REMOTE_SUBSCRIBE_METHOD = "ddp.getAvailableSubscriptions";

//------------------------------------------------------------------//
//  STARTUP SETTINGS
//------------------------------------------------------------------//

Meteor.startup(() => {
    RemoteCollections.loadRemotSubscriptions({id: CURRENT_CONNECTION_ID, method: CURRENT_REMOTE_SUBSCRIBE_METHOD });
});



Tinytest.add('remote-collections - import and initial status', function (test) {

    //importing a fresh RemoteCollections class

    test.isNotNull(RemoteCollections);

    const initialRemoteCollections = RemoteCollections.getCollections();
    test.equal(initialRemoteCollections, {});
    test.equal(Object.keys(initialRemoteCollections).length, 0);

});


Tinytest.add('remote-collections - create single remote ddp connections', function (test) {


    RemoteCollections.addDDPConnectionURL(CURRENT_CONNECTION_ID, CURRENT_CONNECTION_URL);
    const connection = RemoteCollections.getDDPConnection(CURRENT_CONNECTION_ID);
    test.isNotNull(connection);

    const allConnections = RemoteCollections.getAllDDPConnections();
    test.isNotNull(allConnections);
    test.equal(Object.keys(allConnections).length, 1);
    //test.equal(connection.status().connected, true, "connection is not connected to remote " + CURRENT_CONNECTION_URL);
    const observe = {
        added: function (item) {
            console.log('-- remote item added--');
            console.log(item);
        }
        ,

        removed: function (item) {
            console.log('-- remote items removed--');
            console.log(item);
        }
        ,
    };
    RemoteCollections.loadRemoteCollections({id:CURRENT_CONNECTION_ID, method:CURRENT_REMOTE_LOAD_METHOD, observe:observe});
    const collections = RemoteCollections.getCollections();
    test.isNotNull(collections);
    test.equal(Object.keys(collections).length, 1);
    
});




