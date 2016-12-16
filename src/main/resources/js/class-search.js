'use strict';

const lunr = require('lunr');

const class_database_url = 'resources2/class_data.json';

// Code copied pretty directly from
// https://github.com/mdn/promises-test/blob/gh-pages/index.html
const class_database = new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open('GET', class_database_url);
  // When the request loads, check whether it was successful
  request.onload = function() {
    if (request.status === 200) {
      const json = JSON.parse(this.responseText).classes;
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

const classes_index = lunr((index) => {
  index.field('title', {boost: 10});
  index.field('instructor');
  index.field('description');
  index.ref('code');
});

const completed_classes_index = class_database.then((database) => {
  database.forEach((classElement) => {
    classes_index.add(classElement);
  });
  return [database, classes_index];
});

function search(query) {
  return completed_classes_index.then((input) => {
    const [database, index] = input;
    return index.search(query).map((element) => {
      const code = element.ref;
      const sourceObj = database.find((el) => (el.code === code));
      return Object.assign({}, element, {source: sourceObj});
    });
  });
}

module.exports = {
  search
};
