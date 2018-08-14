/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Open database
   */
  static dbPromise() {
    return idb.open('restaurants-db', 1, function (upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
        upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      }
      if (!upgradeDb.objectStoreNames.contains('reviews')) {
        let reviewsStore = upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
        reviewsStore.createIndex('restaurant', 'restaurant_id', { unique: false });
      }
    });
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Store Restaurats in the database 
   * @param {Array} restaurants 
   */
  static storeRestaurants(restaurants) {

    DBHelper.dbPromise().then(db => {
      if (!db) return;

      let tx = db.transaction('restaurants', 'readwrite');
      let store = tx.objectStore('restaurants');

      restaurants.forEach(restaurant => {
        store.put(restaurant);
      });
    })
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    fetch(this.DATABASE_URL + '/restaurants/')
      //fetch the data and store it in the database
      .then(response => {
        response.json().then(restaurants => {

          DBHelper.storeRestaurants(restaurants);

          callback(null, restaurants);
        });
      })
      //if fetching fresh data fails use the ata from the database
      .catch(error => {
        DBHelper.dbPromise().then(db => {

          let tx = db.transaction('restaurants');
          let store = tx.objectStore('restaurants');

          store.getAll().then(restaurants => {
            callback(null, restaurants);
          });
        })
          //Getting data from the database failed. We give up and call the callback with error
          .catch(error => {
            callback(error, null);
          });
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

    let filename = restaurant.photograph || 'placeholder';

    return `/img/${filename}.jpg`;
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
    });
    return marker;
  }


  /**
   * Add/remove a restaurant from favorites
   */
  static restaurantToggleFavorite(restaurant) {

    restaurant.is_favorite = !restaurant.is_favorite;

    return fetch(this.DATABASE_URL + '/restaurants/' + restaurant.id, {
      method: 'PUT',
      body: JSON.stringify({ is_favorite: restaurant.is_favorite })
    }).then(() => {
      return this.dbPromise()
        .then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');

          return store.put(restaurant).then(id => {
            return store.get(id);
          });
        })
    });
  }

  /**
   * Fetch reviews for a restaurant.
   */
  static fetchReviews(restaurantId, callback) {

    fetch(this.DATABASE_URL + `/reviews/?restaurant_id=${restaurantId}`)
      //fetch the data and store it in the database
      .then(response => {
        response.json().then(reviews => {

          DBHelper.storeReviews(reviews);

          callback(null, reviews);
        });
      })
      //if fetching fresh data fails use the ata from the database
      .catch(error => {
        DBHelper.dbPromise().then(db => {

          let tx = db.transaction('reviews');
          let store = tx.objectStore('reviews');
          let restaurantIndex = store.index('restaurant');

          restaurantIndex.getAll(restaurantId).then(reviews => {
            callback(null, reviews);
          });
        })
          //Getting data from the database failed. We give up and call the callback with error
          .catch(error => {
            callback(error, null);
          });
      });
  }

  /**
   * Store Reviews in the database 
   * @param {Array} reviews 
   */
  static storeReviews(reviews) {

    DBHelper.dbPromise().then(db => {
      if (!db) return;

      let tx = db.transaction('reviews', 'readwrite');
      let store = tx.objectStore('reviews');

      reviews.forEach(review => {
        store.put(review);
      });
    })
  }

}
