
import {Mongo} from 'meteor/mongo';
import {DDP} from 'meteor/ddp-client';
import {check} from 'meteor/check';

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

    clear(){
        const connections = Object.values(this.remotes);
        for(let connection of connections){
            connection.disconnect();
        }

		this.REMOTE_COLLECTIONS = {};
		this.remotes = {};
		this.subscriptions = {};
    }

    getCollections() {
        return this.REMOTE_COLLECTIONS;
    }

    /**
     * Returns the ddp connection object reference, returns null if not set.
     * @returns {null|any|*}
     */
    getDDPConnection(id) {
        check(id, String);
        return this.remotes[id];
    }

    getAllDDPConnectionIds() {
        return Object.keys(this.remotes);
    }

    /**
     * Returns all added ddp connection objects.
     */
    getAllDDPConnections(asArray=false) {
        check(asArray, Boolean);
        if (asArray)
            return Object.values(this.remotes);
        else
            return this.remotes;
    }

    /**
     *
     * @param connectionId
     * @param remoteMethodName
     * @returns {boolean}
     */
    getRemoteHasMethod(connectionId, remoteMethodName){
        check(connectionId, String);
        check(remoteMethodName, String);
        const connection = this.remotes[connectionId];
        if (!connection)
            throw new Meteor.Error("Unexpected call to undefined DDP connection: "+connectionId);
        try {
            const remoteMethodCall = connection.call(remoteMethodName);
            return (remoteMethodCall === null || typeof remoteMethodCall === 'undefined');
        } catch(e){
            if (this.debug) {
                console.log(e.message);
                console.log(e.stack);
            }
            return false;
        }
    }

    getAllSubscriptions(){
        return this.subscriptions;
    }

    /**
     * Returns a subscription method by a given id
     * @param id
     * @returns {*}
     */
    getSubscriptionsById(id){
        return this.subscriptions[id];
    }

    /**
     * Sets debugging mode on.
     * @param value boolean, true for debugging
     */
    setDebug(value) {
        check(value, Boolean);
        this.debug = value;
    }

    /**
     * Sets the target from where you want to retrieve your collections
     * @param urlString The full url to connect via ddp
     */
    addDDPConnectionURL(id, urlString) {
        check(id, String);
        check(urlString, String); //FIXME this should check agains a url regex
        this.remotes[id] = DDP.connect(urlString);
    }

    addDDPConnection(id, connection) {
		check(id, String);
		check(connection, Match.Any); //FIXME this should check against a connection obect
        this.remotes[id] = connection;
    }

    /**
     * Loads remote collections via given ddp method. Can be connected to multiple remote objects via id.
     * @param params.id the id of the remote objects to call. Use single string for single call, array of ids for multiple call or leave empty if call all.
     * @param params.method the method name. Must not be null
     * @param params.observe optional observe function to observe changes. If undefined and debug is true, a console log will be initiated
     * @returns {{}} Returns an object with id-boolean pairs. (For each id a result value is attached.)
     */
    loadRemoteCollections(params) {
        check(params, {
            id: String,
            method: String,
            observe: Match.Maybe(Object)
        });
        return this._loadRemote(params, this._loadCollection);
    }

    /**
     * Subscribes to remote collections via ddp. Call on/in meteor.startup() function.
     * @param params.id the id of the remote objects to call. Use single string for single call, array of ids for multiple call or leave empty if call all.
     * @param params.method the method name. Must not be null
     * @returns {{}} Returns an object with id-boolean pairs. (For each id a result value is attached.)
     */
    loadRemoteSubscriptions(params) {
        check(params, {
            id: String,
            method: String,
            observe: Match.Maybe(Object)
        });
        return this._loadRemote(params, this._loadRemoteSubscription);
    }

    /**
     * TODO
     * @param params
     * @param fct
     * @returns {{}}
     * @private
     */
    _loadRemote(params, fct){
        check(params, {
            id: String,
            method: String,
            observe: Match.Maybe(Object)
        });
        check(fct, Function);
        this._checkInputParams(params); //throw errors if wrong
        let results = {};
        const ids = this._parseInputIds(params.id);
        for (let currentId of ids) {

            results[currentId] = fct.call(this, currentId, params.method, params.observe);
        }
        console.log(results);
        return results;
    }

    _checkInputParams(params) {
        check(params, {
            id: String,
            method: String,
            observe: Match.Maybe(Object)
        });
        if (!params)
            throw new Meteor.Error("Must set a parameter object!");
        if (!params.method)
            throw new Meteor.Error("Must set a remote method name to be used to load!");
    }

    _parseInputIds(idObj) {
        check(idObj, Match.OneOf(null, undefined, [String], String));
        if (idObj === null || typeof idObj === 'undefined')
            return this.getAllDDPConnectionIds();
        else if (idObj instanceof Array || Array.isArray(idObj))
            return idObj;//call multiple from array
        else
            return [idObj];
    }

    _loadCollection( id, remoteMethodName, observeFct) {
        check(id, String);
        check(remoteMethodName, String);
        check(observeFct, Match.Maybe(Object));
        try {
            const remote = this.remotes[id];
            if (!remote)
                throw new Meteor.Error("Connection by id [" + id + "] not found, did you add any?");

            const collections = remote.call(remoteMethodName);
            if (!collections)
                throw new Meteor.Error("No collections received from external call. Id=" + id + " / methodname=" + remoteMethodName);

            for (let collectionName of collections) {
                console.log(collectionName+" found");
                this.REMOTE_COLLECTIONS[collectionName] = new Mongo.Collection(collectionName, {connection: remote});
                if (!observeFct && this.debug)
                    observeFct = this.debugObserveFct;
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
        check(id, String);
        check(subscriptionName, String);
        try {
            const remote = this.remotes[id];
            if (!remote)
                throw new Meteor.Error("Connection by id not found, did you add any?");

            //get all subscriptions
            let availableSubscriptions = remote.call(subscriptionName);
            console.log(availableSubscriptions);
            if (!availableSubscriptions)
                throw new Meteor.Error("No subscriptions for name ["+subscriptionName+"] have been found.");
            if (availableSubscriptions.length === 0)
                this.subscriptions[id] = {};

            //if there are any, subscribe now!
            for (let subsciptionName of availableSubscriptions) {
                console.log(subsciptionName);
                if (this.subscriptions[id] === null || typeof this.subscriptions[id] === 'undefined')
                    this.subscriptions[id] = {};

                const currentSubs = this.subscriptions[id];
                currentSubs[subsciptionName] = remote.subscribe(subsciptionName);
                this.subscriptions[id] = currentSubs;
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