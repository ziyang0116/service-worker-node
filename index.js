const vm = require('vm');
const EventEmitter = require('events').EventEmitter;
const ServiceWorkerGlobalScope = require('./worker/serviceworker-global-scope');
const FetchEvent = require('./worker/fetchevent');
const ExtendableEvent = require('./worker/extendable-event');
const fetch = require('node-fetch');
const resolveExtendableEvent = require('./util/resolve-extendable-event');

class ServiceWorker {

    constructor({ scriptContent, scope, interceptFetch, importScript }) {

        this._events = new EventEmitter();
        this._cb = (event, data) => {
            this._events.emit(event, data);
        }

        this.globalScope = new ServiceWorkerGlobalScope({
            scope: scope,
            interceptFetch: interceptFetch,
            importScript: importScript,
            callback: this._cb
        });
        this.caches = this.globalScope.caches;

        // set service worker vm context to global, importScript would use this context too
        global.swContext = vm.createContext(this.globalScope);

        let bindFunction =
            ` Object.getOwnPropertyNames(ServiceWorkerGlobalScope.prototype)
            .filter(x => x !== 'constructor')
            .forEach(key =>{
            if(typeof self[key] === 'function'){
              self[key] = self[key].bind(self);
            }
        })`;
        const bindFunctionScript = new vm.Script(bindFunction);
        bindFunctionScript.runInContext(global.swContext);

        const script = new vm.Script(scriptContent);
        script.runInContext(global.swContext);
    }

    addEventListener(ev, listener) {
        return this._events.addListener(ev, listener)
    }

    removeEventListener(ev, listener) {
        return this._events.removeListener(ev, listener);
    }

    triggerInstallEvent() {
        this._triggerEvent("install");
    }

    triggerActiveEvent() {
        this._triggerEvent("active");
    }

    triggerFetchEvent(url) {
        let eventTrigger =
            `let fetchEvent = new FetchEvent("${url}");
        self.dispatchEvent(fetchEvent);
        fetchEvent.resolve().then(function(response) {
            callback('fetch', response)
        })
        .catch(ex=>{
            console.log(ex);
        });`
        let script = new vm.Script(eventTrigger);
        script.runInContext(global.swContext);
    }

    _triggerEvent(event) {
        let eventTrigger =
            `let swEvent = new ExtendableEvent('${event}');
        self.dispatchEvent(swEvent);
        resolveExtendableEvent(swEvent)
        .then(() => {
            callback('${event}');
        })
        .catch(ex=>{
            console.log(ex);
        });`
        let script = new vm.Script(eventTrigger);
        script.runInContext(global.swContext);
    }

}

module.exports = {
    ServiceWorker,
    FetchEvent,
    ExtendableEvent,
    Request: fetch.Request,
    Response: fetch.Response,
    resolveExtendableEvent,
    ServiceWorkerGlobalScope
}