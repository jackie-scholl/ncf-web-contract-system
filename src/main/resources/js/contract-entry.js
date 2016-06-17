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

/*const createNewContract = function() {
  const contractId = getCognitoCompatibleRandomId();
  console.log('new contract ID:' + contractId);
  //const contractId = 5;
  /*const baseContractData = {
      semester: '', studyLocation: 'On Campus', contractYear: '',
      firstName: '', lastName: '', nNumber: '', expectedGradYear: '',
      boxNumber: '',
      classes: [{courseCode: '', courseName: '', isInternship: false, instructorName: '',
          sessionName: ''}]
  };
  const contractEntry = {
    contractId: contractId, googleId: 'nah',
      contractData: baseContractData, dateLastModified: new Date().getTime()
  };
  console.log('new contract entry:');
  console.log(contractEntry);
  return contractEntry;
  //this.setContractEntry(contractEntry);
  //this.changeContractId(contractId);
};*/
