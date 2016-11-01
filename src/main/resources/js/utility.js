'use strict';

/* Used to display how long ago a contract was made. */
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + ' years';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + ' months';
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + ' days';
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + ' hours';
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + ' minutes';
  }
  return 'just now';
  //return Math.floor(seconds) + ' seconds';
}

/** Resizes an array, getting rid of unnecessary elements. This is used for the
    list of classes inside the contract. The theory is that if you have 4
    classes and then three blank rows, we should get rid of two of those rows
    so it looks better. Also, if you have more classes than allowed, get rid of
    extra classes. Also, if, e.g., there are two classes and two blanks, don't
    get rid of the 'extra' blank. Wow, we really should fix this up at some
    point. */
const resizeArray = function(array, minSize, maxSize, testerCallback,
    spaceFillerCallback) {
  let i=0;
  for (i = array.length-1; i >= 0; i--) {
    const x = array[i];
    const hasData = testerCallback(x);
    if (hasData) {
      break;
    }
  }
  //console.log('index of last class with data: ' + i);
  // there should be exactly one empty element at the end of the array
  let newLength = i + 2;
  if (newLength > maxSize) {
    newLength = maxSize;
  }
  if (newLength < minSize) {
    newLength = minSize;
  }
  if (array.length === newLength) {
    // we're good!
    return array;
  } else if (array.length > newLength) {
    return array.slice(0, newLength);
  } else if (array.length < newLength) {
    let tempArray = array;
    while (tempArray.length < newLength) {
      tempArray = tempArray.concat(spaceFillerCallback());
    }
    return tempArray;
  }
  throw new Error('unreachable');
};

/** Hacky function to check if two arrays are the same. */
function arraysEqual(a1,a2) {
  return JSON.stringify(a1) === JSON.stringify(a2);
}

/** Tests the resizeArray function. This should be moved to legit unit tests
    now that we have those. */
const testResizeArray = function() {
  const zeroTester = (x) => (x !== 0);
  const zeroFiller = () => (0);
  console.assert(arraysEqual(resizeArray([0, 0, 1, 0, 0, 0], 0, 100, zeroTester,
        zeroFiller), [0, 0, 1, 0]));
  console.assert(arraysEqual(resizeArray([1, 0, 0, 6], 0, 100, zeroTester,
        zeroFiller), [1, 0, 0, 6, 0]));
};
/* Wow. */
testResizeArray();

module.exports = {
  arraysEqual: arraysEqual,
  testResizeArray: testResizeArray,
  resizeArray: resizeArray,
  timeSince: timeSince
};
