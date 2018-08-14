var dbPromise = idb.open('rrpwa', 1, function (upgradeDb) {
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('restaurant', {keyPath: 'id'});
            upgradeDb.createObjectStore('review', {autoIncrement: true});
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js', {scope: './'}).then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            return navigator.serviceWorker.ready;
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        }).then(function(registration){
            console.log('Trying to register sync event.');
            registration.sync.register('commentsSync').then( () => {
                console.log('Sync event registered successfully.');
            }).catch(function(error){
                console.log('Error: ', error);
            });
        });
    });
}