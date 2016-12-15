# jkuester:remote-collections

Allows to subscribe and load data from remote collections via ddp, wrapped in manager class.

### Usage

```javascript
import {RemoteCollections} from 'meteor/jkuester:remote-collections';

const REMOTE_COLLECTION_1 = "some-remote-collection-id"; //you can use a hash fct if you want
const REMOTE_URL_1 = 'http://localhost:3030';
const REMOTE_METHOD_1 = 'ddp.getPrivateDatabases';
const REMOTE_SUBS_METHOD_1 = 'ddp.getAvailableSubscriptions';

//RemoteCollections.setDebug(true);
RemoteCollections.addDDPConnectionURL(REMOTE_COLLECTION_1, REMOTE_URL_1);
RemoteCollections.loadRemoteCollections({id:REMOTE_COLLECTION_1, method:REMOTE_METHOD_1});

MY_REMOTE_COLLECTIONS = RemoteCollections.getCollections();


for(let key in MY_REMOTE_COLLECTIONS){
   //add your collections to other services...
}

Meteor.startup(()=>{
    RemoteCollections.loadRemotSubscriptions({id:REMOTE_COLLECTION_1, method:REMOTE_SUBS_METHOD_1});
});
```

### Licence

MIT Licence, see licence file.