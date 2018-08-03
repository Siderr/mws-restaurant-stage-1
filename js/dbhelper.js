/**
 * Common database helper functions.
 */
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants/`;
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        DBHelper.getAllRestaurants().then((data) => {
            if (data.length > 0) {
                callback(null, data)
            } else {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', DBHelper.DATABASE_URL);
                xhr.onload = () => {
                    if (xhr.status === 200) { // Got a success response from server!
                        const json = JSON.parse(xhr.responseText);
                        const restaurants = json;
                        DBHelper.addRestaurants(restaurants);
                        callback(null, restaurants);
                    } else { // Oops!. Got an error from server.
                        const error = (`Request failed. Returned status of ${xhr.status}`);
                        callback(error, null);
                    }
                }
                xhr.send();
            }
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch favorite restaurants
     */
    static fetchFavoriteRestaurants() {
        return fetch('http://localhost:1337/restaurants/?is_favorite=true', {}).then(function (response) {
            return response.json();
        })
    }

    /**
     * Toggle favorite restaurants
     * Makes PUT request to API, then changes classes for style changes and finally updates IndexDB.
     */
    static toggleFavoriteRestaurant(restaurant, event) {
        let _self = this;
        let icon = event.target;
        let favorites = this.fetchFavoriteRestaurants()
            .then(data => {
                if (data.filter(el => el.name == restaurant.name).length > 0) {
                    fetch(`http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=false`, {
                        method: 'PUT'
                    }).then(function () {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        _self.toogleLocalFavorite(restaurant.id);
                    });
                } else {
                    fetch(`http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=true`, {
                        method: 'PUT'
                    }).then(function () {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        _self.toogleLocalFavorite(restaurant.id);
                    });
                }
            });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph}.jpg`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            }
        );
        return marker;
    }

//  Add all restaurants to indexDB
    static addRestaurants(restaurants) {
        dbPromise.then(db => {
            const tx = db.transaction('restaurant', 'readwrite');
            for (let el of restaurants) {
                tx.objectStore('restaurant').put(el);
            }
            return tx.complete;
        });
    }

// Add restaurant to indexDB
    static addRestaurant(restaurant) {
        dbPromise.then(db => {
            const tx = db.transaction('restaurant', 'readwrite');
            tx.objectStore('restaurant').put(restaurant);
            return tx.complete;
        });
    }

//    Get all restaurants from indexDB
    static getAllRestaurants() {
        return dbPromise.then(db => {
            return db.transaction('restaurant')
                .objectStore('restaurant').getAll();
        })
    }

//    Get restaurant by ID from indexDB
    static getRestaurants(id) {
        return dbPromise.then(db => {
            return db.transaction('restaurant')
                .objectStore('restaurant').get(id);
        });
    }

//    Toggle indexDB is_updated property.
    static toogleLocalFavorite(id) {
        this.getRestaurants(id).then(data => {
            let toggled = Object.assign({}, data);
            if (toggled.is_favorite === 'true') {
                toggled.is_favorite = "false";
            } else {
                toggled.is_favorite = "true";
            }
            this.addRestaurant(toggled);
        });
    }
}
