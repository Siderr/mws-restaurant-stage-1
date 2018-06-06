var dbPromise = idb.open('rrpwa', 1, function(upgradeDb) {
    switch(upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore('restaurant', { keyPath: 'id' });
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js', {scope: './'}).then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}