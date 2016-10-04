'use strict';

/** ClassData is an object used to store the fields for a specific class in the
    list of classes. */
function ClassData() {}

ClassData.prototype = {
  courseCode: '',
  courseName: '',
  isInternship: false,
  instructorName: '',
  sessionName: ''
};

/** ContractData is an object used to store all of the form information
    contained in a contract, like student name and contract semester.
    ContractData has a list of ClassData. */
function ContractData() {
  this.classes = new Array(4).fill(0).map(() => new ClassData());
}

ContractData.prototype = {
  semester: '',
  studyLocation: 'On Campus',
  contractYear: '',
  firstName: '',
  lastName: '',
  nNumber: '',
  expectedGradYear: '',
  boxNumber: ''
};

/** A ContractEntry stores all of the information we need to handle for an
    individual contract, including its unique ID, the data it contains, and the
    date/time it was last modified. */
function ContractEntry(contractId) {
  this.contractId = contractId;
  this.contractData = new ContractData();
  this.dateLastModified = new Date().getTime();
}

module.exports = {
  ClassData: ClassData,
  ContractData: ContractData,
  ContractEntry: ContractEntry
};
