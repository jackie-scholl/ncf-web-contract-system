'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;
const login = require('../../main/resources/js/login.js');

describe('login', () => {
  it('should succeed', () => {
    assert.isOk(true);
  });
  describe('render function', () => {
    it('should be defined', () => {
      assert.isDefined(login.render);
    });
  });
});
