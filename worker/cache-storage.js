const url = require('url');

class DummyCache {

    constructor(name, scope) {
        this.name = name;
        this.scope = scope;
        this.entries = [];
    }

    add(urlToAdd) {
        this.entries.push(url.resolve(this.scope, urlToAdd));
    }

    addAll(urls) {
        urls.forEach((u) => this.add(u))
    }

    keys() {
        return this.entries;
    }

    put(request, response){
        this.entries.push(request);
    }

    match(){
        return Promise.resolve(undefined); 
    }

}

class ServiceWorkerCache {

    constructor(scope) {
        this.scope = scope;
        this.caches = [];
    }

    match() {
        return Promise.resolve(undefined);
    }

    open(name) {

        let cacheInstance = this.caches.find((c) => c.name === name);

        if (!cacheInstance) {
            cacheInstance = new DummyCache(name, this.scope);
            this.caches.push(cacheInstance);
        }

        return Promise.resolve(cacheInstance);
    }

    keys() {
        return Promise.resolve(this.caches.map((c) => c.name));
    }

    delete(name) {
        let cacheInstance = this.caches.find((c) => c.name === name);
        if (!cacheInstance) {
            return;
        }
        let indexOfCache = this.caches.indexOf(cacheInstance);
        this.caches.splice(indexOfCache, 1);
    }
}

module.exports = ServiceWorkerCache;