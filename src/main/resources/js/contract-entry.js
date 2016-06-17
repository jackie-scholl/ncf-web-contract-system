const ClassData = () => ({
  courseCode: '',
  courseName: '',
  isInternship: false,
  instructorName: '',
  sessionName: ''
});

const ContractData = () => ({
  semester: '',
  studyLocation: 'On Campus',
  contractYear: '',
  firstName: '',
  lastName: '',
  nNumber: '',
  expectedGradYear: '',
  boxNumber: '',
  classes: [new ClassData()]
});

const ContractEntry = (contractId) => ({
  contractId: contractId,
  contractData: new ContractData,
  dateLastModified: new Date().getTime()
});

module.exports = {
  ClassData: ClassData,
  ContractData: ContractData,
  ContractEntry: ContractEntry
};
