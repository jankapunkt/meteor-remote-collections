# jkuester:remote-collections

Allows to subscribe and load data from remote collections via ddp, wrapped in manager class.

### Usage

```javascript
import {RemoteCollections} from 'meteor/jkuester:remote-collections';

const REMOTE_COLLECTION_1 = "some-remote-collection-id"; //you can use a hash fct if you want
const REMOTE_URL_1 = 'http://localhost:3030';
const REMOTE_METHOD_1 = 'ddp.getPrivateDatabases';
const REMOTE_SUBS_METHOD_1 = 'ddp.getAvailableSubscriptions';

//subscriptions must be put in startup
Meteor.startup(()=>{
    RemoteCollections.loadRemoteSubscriptions({id:REMOTE_COLLECTION_1, method:REMOTE_SUBS_METHOD_1});
});


//you can set debug mode to flood your console...
//RemoteCollections.setDebug(true);

//add a new ddp connection with a given id and url to listen
RemoteCollections.addDDPConnectionURL(REMOTE_COLLECTION_1, REMOTE_URL_1);

//load the collections by a given method name
//the method should exist in the external app at {REMOTE_URL_1} and return a list of collection names
//those collections will be fetched and loaded
//you can pass an optional observe object to observe your subsribed actions on the external db
RemoteCollections.loadRemoteCollections({id:REMOTE_COLLECTION_1, method:REMOTE_METHOD_1, observe:{}});

//you can retrieve the collections from the class and...
MY_REMOTE_COLLECTIONS = RemoteCollections.getCollections();

//..add your collections to other services
for(let key in MY_REMOTE_COLLECTIONS){
   //do something with your collections
}

```

### Licence

MIT Licence, see licence file.