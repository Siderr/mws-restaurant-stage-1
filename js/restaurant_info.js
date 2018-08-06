let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = restaurant.name;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        createReviewFormHTML();
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
    createReviewFormHTML();
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    let time = new Date(review.createdAt);
    date.innerHTML = time.toDateString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/*
* Create HTML for the form.
* */

createReviewFormHTML = () => {
    let reviews = document.querySelector('#reviews-list');
    let id = getParameterByName('id');
    const form = document.createElement('form');
    form.classList.add('review-form');

    let reviewFormHeader = document.createElement('h2');
    reviewFormHeader.innerText = 'Add new comment';
    form.append(reviewFormHeader);

    let idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.value = id;
    form.append(idInput);

    let nameLabel = document.createElement('label');
    nameLabel.for = 'name';
    nameLabel.innerText = 'Name';
    form.append(nameLabel);

    let name = document.createElement('input');
    name.type = 'text';
    name.name = 'name';
    name.id = 'name';
    name.placeholder = 'Enter your name';
    name.required = true;
    form.append(name);

    let ratingLabel = document.createElement('label');
    ratingLabel.for = 'rating';
    ratingLabel.innerText = 'Rating';
    form.append(ratingLabel);

    let rating = document.createElement('input');
    rating.type = 'number';
    rating.name = 'rating';
    rating.id = 'rating';
    rating.placeholder = 'Rating';
    rating.required = true;
    rating.min = 1;
    rating.max = 10;
    form.append(rating);

    let commentLabel = document.createElement('label');
    commentLabel.for = 'comments';
    commentLabel.innerText = 'Comment';
    form.append(commentLabel);

    let comments = document.createElement('textarea');
    comments.name = 'comments';
    comments.id = 'comments';
    comments.placeholder = 'Enter your comment';
    comments.rows = 4;
    comments.cols = 50;
    comments.required = true;
    form.append(comments);

    let submit = document.createElement('input');
    submit.classList.add('button');
    submit.type = 'submit';
    submit.value = "Submit";
    submit.addEventListener('click', function() { DBHelper.addComment(event)});
    form.append(submit);

    reviews.parentElement.appendChild(form);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerHTML = restaurant.name;
    a.setAttribute('aria-current', 'page')
    li.appendChild(a);
    // li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.onload = () => {

    const ariaRole = document.getElementById('map');
    ariaRole.setAttribute('aria-hidden', 'true');

//     window.google.maps.event.addListenerOnce(map, 'idle', function () {
// //    Set map iframe title.
//         document.querySelector("iframe").setAttribute('title', 'Google Map');
//     });

};


