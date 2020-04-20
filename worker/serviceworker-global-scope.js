const EventEmitter = require('events').EventEmitter;
const fetch = require('node-fetch');
const CacheStorage = require('./cache-storage');
const applyIndexedDBTo = require('./indexeddb');
const URL = require('./url');
const getAllKeys = require('../util/get-all-keys');
const vm = require('vm');
const ExtendableEvent = require("./extendable-event");
const resolveExtendableEvent = require('../util/resolve-extendable-event');
const FetchEvent = require("./fetchevent");

function createImportScripts(importFunction, scope) {

    return function () {

        let scripts = Array.from(arguments);

        scripts.forEach((url) => {
            let importUrl = null;
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                importUrl = scope + url;
            } else {
                importUrl = url;
            }
            let scriptContent = importFunction(importUrl);
            let script = new vm.Script(scriptContent);
            script.runInContext(global.swContext);
        })
    }
}


module.exports = class ServiceWorkerGlobalScope {
    constructor({ scope, interceptFetch, importScript, callback }) {
        if (interceptFetch) {
            this.fetch = function () {
                let ret = interceptFetch(arguments, fetch);

                if (!ret || !ret.then) {
                    return Promise.reject(new Error("You must return a promise in interceptFetch"));
                }

                return ret;

            }
        } else {
            this.fetch = fetch;
        }

        if (!importScript) {
            console.warn("No importScript function provided to worker context");
            importScript = function () {
                throw new Error("importScript function was not provided to worker context");
            }
        }

        this.importScripts = createImportScripts(importScript, scope);

        this.callback = callback;

        this.Request = fetch.Request;
        this.Response = fetch.Response;
        this._events = new EventEmitter();
        // this.console = console;
        this.self = this;

        this.registration = {
            scope: scope
        }

        this.clients = {
            claim: function () {
                return Promise.resolve(null)
            },
            matchAll: function () {
                return Promise.resolve([])
            }
        }

        this.caches = new CacheStorage(scope);
        this.location = {}
        this.ExtendableEvent = ExtendableEvent;
        this.URL = URL;
        this.getAllKeys = getAllKeys;
        this.ServiceWorkerGlobalScope = ServiceWorkerGlobalScope;
        this.resolveExtendableEvent = resolveExtendableEvent;
        this.FetchEvent = FetchEvent;
        applyIndexedDBTo(this);
    }

    addEventListener(ev, listener) {
        return this._events.addListener(ev, listener)
    }

    removeEventListener(ev, listener) {
        return this._events.removeListener(ev, listener);
    }

    dispatchEvent(ev) {
        return this._events.emit(ev.type, ev);
    }

    skipWaiting() {

    }
};
