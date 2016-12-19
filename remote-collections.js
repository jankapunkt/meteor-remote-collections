
import {Mongo} from 'meteor/mongo';
import {DDP} from 'meteor/ddp-client'

class RemoteCollectionManager {
    constructor() {
        this.REMOTE_COLLECTIONS = {};
        this.remotes = {};
        this.subscriptions = {};
        this.debug = false;
        this.debugObserveFct = {
            added: function (item) {
                console.log('-- remote item added--');
                console.log(item);
            },

            removed: function (item) {
                console.log('-- remote items removed--');
                console.log(item);
            }
        };
        this._loadCollection = this._loadCollection.bind(this);
        this._loadRemoteSubscription = this._loadRemoteSubscription.bind(this);
    }

    getCollections() {
        return this.REMOTE_COLLECTIONS;
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

    getAllSubscriptions(){
        return this.subscriptions;
    }

    getSubscriptionsById(id){
        return this.subscriptions[id];
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
     * Loads remote collections via given ddp method. Can be connected to multiple remote objects via id.
     * @param params.id the id of the remote objects to call. Use single string for single call, array of ids for multiple call or leave empty if call all.
     * @param params.method the method name. Must not be null
     * @param params.observe optional observe function to observe changes. If undefined and debug is true, a console log will be initiated
     * @returns {{}} Returns an object with id-boolean pairs. (For each id a result value is attached.)
     */
    loadRemoteCollections(params) {
        return this._loadRemote(params, this._loadCollection);
    }

    /**
     * Subscribes to remote collections via ddp. Call on/in meteor.startup() function.
     * @param params.id the id of the remote objects to call. Use single string for single call, array of ids for multiple call or leave empty if call all.
     * @param params.method the method name. Must not be null
     * @returns {{}} Returns an object with id-boolean pairs. (For each id a result value is attached.)
     */
    loadRemoteSubscriptions(params) {
        return this._loadRemote(params, this._loadRemoteSubscription);
    }

    _loadRemote(params, fct){
        this._checkInputParams(params); //throw errors if wrong
        let results = {};
        const ids = this._parseInputIds(params.id);
        console.log("load remote");
        for (let currentId of ids) {

            results[currentId] = fct.call(this, currentId, params.method, params.observe);
        }
        console.log(results);
        return results;
    }

    _checkInputParams(params) {
        if (!params)
            throw new Meteor.Error("Must set a parameter object!");
        if (!params.method)
            throw new Meteor.Error("Must set a remote method name to be used to load!");
    }

    _parseInputIds(idObj) {
        if (idObj === null || typeof idObj === 'undefined')
            return this.getAllDDPConnectionIds();
        else if (typeof idObj === 'array' || idObj instanceof Array)
            return idObj;//call multiple from array
        else
            return [idObj];
    }

    _loadCollection( id, remoteMethodName, observeFct) {
        try {
            const remote = this.remotes[id];
            if (!remote)
                throw new Meteor.Error("Connection by id not found, did you add any?");

            const collections = remote.call(remoteMethodName);
            if (!collections)
                throw new Meteor.Error("No collections received from external call. Id=" + id + " / methodname=" + remoteMethodName);

            for (let collectionName of collections) {
                console.log(collectionName+" found");
                this.REMOTE_COLLECTIONS[collectionName] = new Mongo.Collection(collectionName, {connection: remote});
                if (!observeFct && this.debug)
                    observeFct = debugObserveFct;
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

    _loadRemoteSubscription(id, subscriptionName) {
        console.log("LOAD SUB: "+id+" / "+subscriptionName);
        try {
            const remote = this.remotes[id];
            if (!remote)
                throw new Meteor.Error("Connection by id not found, did you add any?");

            //get all subscriptions
            let availableSubscriptions = remote.call(subscriptionName);
            if (availableSubscriptions) {
                //if there are any, subscribe now!
                for (let subsciptionName of availableSubscriptions) {
                    if (this.subscriptions[id] === null || typeof this.subscriptions[id] === 'undefined')
                        this.subscriptions[id] = {};

                    const currentSubs = this.subscriptions[id];
                    currentSubs[subsciptionName] = remote.subscribe(subsciptionName);
                    this.subscriptions[id] = currentSubs;
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