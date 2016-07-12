'use strict';
const assert = require('chai').assert;
const expect = require('chai').expect;
const contractEntry = require('../../main/resources/js/contract-entry.js');

describe('contract-entry', () => {
  it('should succeed', () => {
    assert.isOk(true);
  });
  describe('ClassData', () => {
    const thing = contractEntry.ClassData;

    it('should exist', () => {
      assert.isOk(thing);
    });

    it('should not be callable as a function', () => {
      assert.throws(() => {
        thing()
      });
    });

    //console.log(`New thing: ${JSON.stringify(x)}. CourseName: ${x.courseName}. CourseCode: ${x.courseCode}.`);
    it('should be callable as a constructor', () => {
      assert.isOk(new thing());
    });
    describe('ClassData instance', () => {
      const thing3 = new thing();
      it('should define necessary properties', () => {
        //expect(thing3).to.have.property('courseCode');
        //expect(thing3).to.have.property('courseName');
        assert.isDefined(thing3.courseCode);
        assert.isDefined(thing3.courseName);
        assert.isDefined(thing3.isInternship);
        assert.isDefined(thing3.instructorName);
        assert.isDefined(thing3.sessionName);
        assert.isUndefined(thing3.coursefkagb);
      });
    });
  });
  describe('ContractData', () => {
    const thing = contractEntry.ContractData;

    it('should exist', () => {
      assert.isOk(thing);
    });
    it('should be callable as a constructor', () => {
      assert.isOk(new thing());
    });
  });
  describe('ContractEntryData', () => {
    const thing = contractEntry.ContractEntry;

    it('should exist', () => {
      assert.isOk(thing);
    });
    it('should be callable as a constructor', () => {
      assert.isOk(new thing(0));
    });
    it('should be have a date last modified', () => {
      assert.isOk(new thing(0).dateLastModified);
    });
  });
});
