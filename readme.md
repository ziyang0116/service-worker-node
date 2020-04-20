# service-worker-node

`service-worker-node` provides a Service Worker environment inside nodejs. We can execute Service Worker JS in server side, fetch PWA  precached resource list.

`service-worker-node` and [node-service-worker](https://github.com/gdnmobilelab/node-service-worker) are similar.

Compared with [node-service-worker](https://github.com/gdnmobilelab/node-service-worker), `service-worker-node`  implements more features:

- supports `importScript`

- can execute google PWA lib [Workbox](https://developers.google.com/web/tools/workbox)

## How to use

```shell
npm install service-worker-node
```

At first, creat a ServiceWorker:

```js

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
```

### trigger event

Install event and Active event:

```js

    sw.addEventListener("install", () => {
        //do something when service worker has already installed. 
        sw.triggerActiveEvent();
    });
    sw.addEventListener("active", ()=>{
        //do something when service worker has already actived.
    })
    sw.triggerInstallEvent();

```

Fetch event:

```js

    sw.addEventListener("fetch", (response)=>{
        console.log(response);
    })

    sw.triggerFetchEvent("https://mdn.github.io/pwa-examples/js13kpwa/data/img/emma-3d.jpg");

```

### Fetch precached resource

```js

    sw.addEventListener("install", () => {
            sw.caches.keys()
                .then((keys) => {
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

```

### Demo

[Demo](./test/worker.js)
