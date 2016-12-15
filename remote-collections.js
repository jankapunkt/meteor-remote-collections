
import {Mongo} from 'meteor/mongo';
import {DDP} from 'meteor/ddp-client'

class RemoteCollectionManager {
    constructor() {
        this.REMOTE_COLLECTIONS = {};
        this.remotes = {};
        this.debug = false;
    }

    getCollections() {
        return this.REMOTE_COLLECTIONS;
    }

    /**
     * Sets debugging mode on.
     * @param value boolean, true for debugging
     */
    setDebug(value) {
        this.debug = value;
    }

    /**
     * Sets the target from where you want to retrieve your collections
     * @param urlString The full url to connect via ddp
     */
    addDDPConnectionURL(id, urlString) {
        this.remotes[id] = DDP.connect(urlString);
    }

    /**
     * Returns the ddp connection object reference, returns null if not set.
     * @returns {null|any|*}
     */
    getDDPConnection(id) {
        return this.remotes[id];
    }

    getAllDDPConnectionIds() {
        return Object.keys(this.remotes);
    }

    /**
     * Returns all added ddp connection objects.
     */
        getAllDDPConnections() {
        return this.remotes;
    }

    /**
     * Loads remote collections via given ddp method. Can be connected to multiple remote objects via id.
     * @param params.id the id of the remote objects to call. Use single string for single call, array of ids for multiple call or leave empty if call all.
     * @param params.method the method name. Must not be null
     * @param params.observe optional observe function to observe changes. If undefined and debug is true, a console log will be initiated
     * @returns {{}} Returns an object with id-boolean pairs. (For each id a result value is attached.)
     */
    loadRemoteCollections(params) {
        if (!params)
            throw new Meteor.Error("Must set a parameter object!");
        if (!params.method)
            throw new Meteor.Error("Must set a remote method name to be used to load!");

        let results = {};
        let ids;
        const id = params.id;

        if (id === null || typeof id === 'undefined')
            ids = this.getAllDDPConnectionIds();
        //call all ids
        else if (typeof id == 'array' || id instanceof Array)
            ids = id;//call multiple from array
        else
            ids = [id];

        for (let currentId of ids) {
            results[id] = this._loadCollection(
                currentId, params.method, params.observe);
        }

        return results;
    }

    _loadCollection(id, remoteMethodName, observeFct) {
        try {

            const remote = this.remotes[id];
            if (!remote)
                throw new Meteor.Error("Connection by id not found, did you add any?");

            const collections = remote.call(remoteMethodName);
            if (!collections)
                throw new Meteor.Error("No collections received from external call. Id=" + id + " / methodname=" + remoteMethodName);

            for (let collectionName of collections) {
                this.REMOTE_COLLECTIONS[collectionName] = new Mongo.Collection(collectionName, {connection: remote});
                if (!observeFct && this.debug)
                    observeFct = {
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
                if (observeFct)
                    this.REMOTE_COLLECTIONS[collectionName].find().observe(observeFct);
            }
            return true;
        }
        catch (e) {
            if (this.debug)
                console.log(e.stack);
            return false;
        }
    }


    /**
     * Subscribes to remote collections via ddp. Call on/in meteor.startup() function.
     * @param params.id the id of the remote objects to call. Use single string for single call, array of ids for multiple call or leave empty if call all.
     * @param params.method the method name. Must not be null
     * @returns {{}} Returns an object with id-boolean pairs. (For each id a result value is attached.)
     */
    loadRemotSubscriptions(params) {
        if (!params)
            throw new Meteor.Error("Must set a parameter object!");
        if (!params.method)
            throw new Meteor.Error("Must set a remote method name to be used to load!");

        let results = {};
        let ids;
        const id = params.id;

        if (id === null || typeof id === 'undefined')
            ids = this.getAllDDPConnectionIds();
        //call all ids
        else if (typeof id == 'array' || id instanceof Array)
            ids = id;//call multiple from array
        else
            ids = [id];

        for (let currentId of ids) {
            results[id] = this._loadRemoteSubscription(
                currentId, params.method);
        }

        return results;
    }

    _loadRemoteSubscription(id, subscriptionName) {
        try {
            const remote = this.remotes[id];
            if (!remote)
                throw new Meteor.Error("Connection by id not found, did you add any?");

            //get all subscriptions
            let availableSubscriptions = remote.call(subscriptionName);
            if (availableSubscriptions) {
                //if there are any, subscribe now!
                for (let subsciptionName of availableSubscriptions) {
                    remote.subscribe(subsciptionName);
                }
            }
            return true;
        } catch (e) {
            if (this.debug)
                console.log(e.stack);
            return false;
        }

    }
}

export const RemoteCollections = new RemoteCollectionManager();