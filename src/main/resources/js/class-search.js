'use strict';

const class_database_url = 'resources2/class_data.json';

/*const class_database = new Promise((resolve, reject) => {
  $.getJSON(class_database_url, resolve).fail(reject);
})*/

// Code copied pretty directly from
// https://github.com/mdn/promises-test/blob/gh-pages/index.html
const class_database = new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open('GET', class_database_url);
  //request.responseType = 'blob';
  // When the request loads, check whether it was successful
  request.onload = function() {
    if (request.status === 200) {
      const json = JSON.parse(this.responseText);
      // If successful, resolve the promise by passing back the request response
      resolve(json);
    } else {
      // If it fails, reject the promise with a error message
      reject(Error('Classes database didn\'t load successfully; error code:' +
        request.statusText));
    }
  };
  request.onerror = function() {
    // Also deal with the case when the entire request fails to begin with
    // This is probably a network error, so reject the promise with an
    // appropriate message
    reject(Error('There was a network error.'));
  };
  // Send the request
  request.send();
});

function search(searchTerm) {
  class_database.then(

  )
}

module.exports = {
  search
};
