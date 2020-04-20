
const url = require("url");

module.exports = class URL {

    constructor(input, base){
        this._myUrl = url.parse(input, base);

    }

    get hostname() {
        return this._myUrl.hostname;
    }

    get host(){
        return this._myUrl.host;
    }

    get href(){
        return this._myUrl.href;
    }

    get origin(){
        return this._myUrl.origin;
    }

    get hash(){
        return this._myUrl.hash;
    }

    set hash(value){
    }

    get port(){
        return this._myUrl.port;
    }

    get pathname(){
        return this._myUrl.pathname;
    }

    get protocol(){
        return this._myUrl.protocol;
    }
    
}