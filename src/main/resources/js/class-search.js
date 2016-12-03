'use strict';

const lunr = require('lunr');

const class_database_url = 'resources2/class_data.json';

/*const class_database = new Promise((resolve, reject) => {
  $.getJSON(class_database_url, resolve).fail(reject);
})*/

// Code copied pretty directly from
// https://github.com/mdn/promises-test/blob/gh-pages/index.html
const class_database = new Promise((resolve, reject) => {
  console.log('starting request');
  const request = new XMLHttpRequest();
  request.open('GET', class_database_url);
  //request.responseType = 'blob';
  // When the request loads, check whether it was successful
  request.onload = function() {
    if (request.status === 200) {
      console.log('request is good!');
      const json = JSON.parse(this.responseText).classes;
      // If successful, resolve the promise by passing back the request response
      console.log('resolving');
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
  console.log('adding to index');
  database.forEach((classElement) => {
    classes_index.add(classElement);
  });
  console.log('returning complete index');
  return [database, classes_index];
});

function search(query) {
  console.log('recieved search');
  return completed_classes_index.then((input) => {
    const [database, index] = input;
    return index.search(query).map((element) => {
      const code = element.ref;
      console.log('using code '+code);
      const sourceObj = database.find((el) => (el.code === code));
      console.log('found sourceObj '+sourceObj);
      return Object.assign({}, element, {source: sourceObj});
    });
  });
}

module.exports = {
  search
};
