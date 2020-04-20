
const request = require('request');
const { ServiceWorker, Response } = require('../index');
var syncRequest = require('sync-request');

function get(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(body);
        });
    })
}

const url = "https://mdn.github.io/pwa-examples/js13kpwa/sw.js"
get(url)
    .then((content) => {
        const sw = new ServiceWorker({
            scriptContent: content,
            scope: "https://mdn.github.io/pwa-examples/js13kpwa/",
            // interceptFetch: (args) => {
            //     return Promise.resolve(new Response());
            // },
            importScript: (url) => {
                var res = syncRequest('GET', url);
                return res.getBody('utf8');
            }
        });
        sw.addEventListener("install", () => {
            sw.caches.keys()
                .then((keys) => {
                    console.log("keys:");
                    console.log(keys);
                    let openPromises = keys.map((key) => sw.caches.open(key));
                    return Promise.all(openPromises);
                })
                .then((cacheObjects) => {
                    let keysPromises = cacheObjects.map((c) => c.keys());
                    return Promise.all(keysPromises);
                })
                .then((cacheEntryArrays) => {
                    let allEntries = Array.prototype.concat.apply([], cacheEntryArrays);
                    allEntries = allEntries.map(item => {
                        if (typeof item === 'object') {
                            return item.url;
                        } else {
                            return item;
                        }
                    });
                    console.log(allEntries)
                })
        });
        sw.triggerInstallEvent();

        sw.addEventListener("fetch", (response)=>{
            console.log("on fetch");
            console.log(response);
        })

        sw.triggerFetchEvent("https://mdn.github.io/pwa-examples/js13kpwa/data/img/emma-3d.jpg");
    })
