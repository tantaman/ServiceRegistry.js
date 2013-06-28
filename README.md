ServiceRegistry.js
==================

Micro-Services for Javascript

ServiceRegistry.js decouples your Javascript components by allowing your components 
to relieve themselves of the responsibility of instantiating their dependencies.

```javascript

// ======== in components/localStorage.js ===========
registry.register({
        interfaces: 'web.storage',
        meta: {
          limit: '5mb',
          location: 'local',
          browsers: ['webkit', 'moz', 'o']
        }
      }, localStorageAdapter);

// ======== in components/filesystemApi.js ============
registry.register({
  interfaces: 'web.storage',
  meta: {
    limit: 'infinity',
    location: 'local',
    browsers: ['webkit']
  }
}, filesystemAdapter);

// ======== in components/remoteStorage.js ============
registry.register({
  interfaces: 'web.storage',
  meta: {
    limit: 'unk',
    location: 'remote',
    browsers: ['webkit', 'moz', 'o']
  }
}, remoteStorageAdapter);


// ======== in app/main.js ================
var storageProviders = registry.get({
  interfaces: 'web.storage',
  meta: {
    location: 'local'
  }});
  
// decide what local storage provider to use
// (say based on browser or size limit), or use them both.
```
