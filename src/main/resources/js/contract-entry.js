'use strict';


/*const ClassData = () => ({
  courseCode: '',
  courseName: '',
  isInternship: false,
  instructorName: '',
  sessionName: ''
});*/

function ClassData() {}

ClassData.prototype = {
  courseCode: '',
  courseName: '',
  isInternship: false,
  instructorName: '',
  sessionName: ''
};

/*const ContractData = () => ({
  semester: '',
  studyLocation: 'On Campus',
  contractYear: '',
  firstName: '',
  lastName: '',
  nNumber: '',
  expectedGradYear: '',
  boxNumber: '',
  classes: [new ClassData()]
});*/

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

/*const ContractEntry = (contractId) => ({
  contractId: contractId,
  contractData: new ContractData(),
  dateLastModified: new Date().getTime()
});*/

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
