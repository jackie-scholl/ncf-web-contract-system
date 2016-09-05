//Copyright 2016 Jackie Scholl
'use strict';
const React = require('react');
const ReactDOM = require('react-dom');
const loginHandler = require('./login.js').render();
const contractStorageCognito = require('./contract-storage-cognito');
const ContractEntry = require('./contract-entry.js').ContractEntry;

const FullPage = React.createClass({
  getInitialState: function() {
    console.log('window.location.hash: '+window.location.hash);
    const h = window.location.hash;
    const contractId = h? h.slice(1) : null;
    return {
      contractId: contractId,
      contractMap: new Map(),
      logins: null
    };
  },
  updateContractMap: function(contractMap) {
    this.setState({contractMap: contractMap});
  },
  changeContractId: function(contractId) {
    window.location.hash = '#' + contractId;
    this.setState({contractId: contractId});
  },
  createContract: function() {
    const id = contractStorageCognito.getNewId();
    const entry = new ContractEntry(id);
    this.state.contractStorageHandler.setContractEntry(entry);
    this.changeContractId(id);
  },
  componentWillMount: function() {
    loginHandler.addListener((x) => {this.setState({logins: x.logins});});
    const contractStorageHandler =
        new contractStorageCognito.ContractStorageHandler(
        loginHandler, this.updateContractMap);
    this.setState({contractStorageHandler: contractStorageHandler});
  },
  cognitoSync: function() {
    this.state.contractStorageHandler.contractStorage.sync();
  },
  render: function() {
    let optionalContract = null;
    if (this.state.contractId != null &&
        this.state.contractMap.has(this.state.contractId)) {
      optionalContract =
          <ContractBox
            contractEntry={this.state.contractMap.get(this.state.contractId)}
            handleUpdate={/*this.handleContractBoxUpdate*/
                          this.state.contractStorageHandler.setContractEntry}
            logins={this.state.logins}
            pollInterval={2000}
          />;
    }

    return (
      <div className='container-fluid'>
        <div className='row'>
          <ContractList changeContractId={this.changeContractId}
            onUpdate={this.handleContractListUpdate}
            createContract={this.createContract}
            currentContractId={this.state.contractId}
            contractMap={this.state.contractMap}
            putContract={this.handleContractFormUpdate}
            pollInterval={2000}
          />
          {optionalContract}
          <div className='col-md-5 col-md-offset-2'>
            <button className='btn btn-default' type='button'
                onClick={this.cognitoSync}>
              Sync
            </button>
          </div>
        </div>
      </div>
    );
  }
});

const ContractList = React.createClass({
  createContract: function(e) {
    e.preventDefault();
    this.props.createContract();
  },
  render: function() {
    const contractEntries = [...this.props.contractMap.values()]
        .sort((a, b) => b.dateLastModified - a.dateLastModified)
        .map((x) =>
          (<ContractElement value={x} key={x.contractId}
              changeContractId={this.props.changeContractId}
              isCurrent={x.contractId === this.props.currentContractId}/>));
    return (
      <div className='col-sm-3 col-md-2 sidebar'>
        <ul className='nav nav-sidebar'>
          <li>Contract List</li>
          <li><a href='' onClick={this.createContract} id='new-contract-link'
              className='logged-in'>
            New Contract
          </a></li>
        </ul>
        <ul className='nav nav-sidebar'>
          {contractEntries}
        </ul>
      </div>
    );
  }
});

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

const ContractElement = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    this.props.changeContractId(this.props.value.contractId);
  },
  render: function() {
    let classesString = '';
    const classes = this.props.value.contractData.classes.map((x) =>
          (x.courseName)).filter((x) => (x !== ''));
    if (classes.length > 0) {
      classesString = '[' + classes.join().substring(0, 15) + ']; ';
    }
    const wholeString = this.props.value.contractData.semester + ' ' +
        this.props.value.contractData.contractYear + '; ' +
        classesString + '' +
        timeSince(new Date(this.props.value.dateLastModified)) + ' ago';
    return (
      <li id={this.props.value.contractId}
          className={this.props.isCurrent? 'active' : ''} >
        <a href={'#' + this.props.value.contractId} onClick={this.handleClick}>
          {wholeString}
        </a>
      </li>
    );
  }
});

function ClassData(courseCode, courseName, isInternship, instructorName,
    sessionName) {
  console.assert(isInternship === true || isInternship === false, 'bad value: '
      + isInternship);
  return {courseCode: courseCode, courseName: courseName, isInternship:
      isInternship, instructorName: instructorName, sessionName: sessionName};
}

const emptyClassData = function() {
  return new ClassData('', '', false, '', '');
};

const classDataFrom = function(data) {
  return new ClassData(data.courseCode, data.courseName, data.isInternship,
        data.instuctorName, data.sessionName);
};

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

function arraysEqual(a1,a2) {
  return JSON.stringify(a1) === JSON.stringify(a2);
}

const testResizeArray = function() {
  const zeroTester = (x) => (x !== 0);
  const zeroFiller = () => (0);
  console.assert(arraysEqual(resizeArray([0, 0, 1, 0, 0, 0], 0, 100, zeroTester,
        zeroFiller), [0, 0, 1, 0]));
  console.assert(arraysEqual(resizeArray([1, 0, 0, 6], 0, 100, zeroTester,
        zeroFiller), [1, 0, 0, 6, 0]));
};

testResizeArray();


const ContractBox = React.createClass({
  handleUpdate: function(newData) {
    const updatedContractEntry = Object.assign({}, this.props.contractEntry);
    updatedContractEntry.contractData = newData;
    updatedContractEntry.dateLastModified = new Date().getTime();
    this.props.handleUpdate(updatedContractEntry);
  },

  render: function() {
    console.log(this.props.contractEntry);
    return (
      <div className='col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main'>
        <ContractForm pollInterval={this.props.pollInterval}
          contractId={this.props.contractEntry.contractId}
          value={this.props.contractEntry.contractData}
          handleUpdate={this.handleUpdate}
        />
        <LivePreview value={this.props.contractEntry}
            logins={this.props.logins} />
      </div>
    );
  }
});

const LivePreview = React.createClass({
  render: function() {
    const renderContractRequest = {
      contractData: this.props.value.contractData,
      authentication: this.props.logins,
      options: {
        flatten_pdf: true
      }
    };
    const requestJson = JSON.stringify(renderContractRequest);
    const contractPdfUrl = '/render-contract?renderContractRequest='
        + requestJson;
    return (
      <iframe src={contractPdfUrl} width='100%' height='1000px'>
        <a href={contractPdfUrl}>
          Click here to see PDF
        </a>
      </iframe>
    );
  }
});


const ContractForm = React.createClass({
  updateHandlerGenerator: function(identifier) {
    return ((value) => {
      const newState = Object.assign({}, this.props.value);
      newState[identifier] = value;
      this.props.handleUpdate(newState);
    });
  },

  magic: function(identifier) {
    return {value: this.props.value[identifier],
      handleUpdate: this.updateHandlerGenerator(identifier),
      id: 'ContractForm.'+this.props.contractId+'.'+identifier};
  },

  render: function() {
    return (
      <div className='contractForm'>
      <h1 className='page-header'>Contract Form</h1>
      <form id='contractForm' className='blank-form'>
      <div className='row' style={{marginBottom: '2em'}}>
      <div className='col-sm-3'><TextInput displayName='First Name'
          placeHolder='Jane' magic={this.magic('firstName')} /></div>
      <div className='col-sm-3'><TextInput displayName='Last Name'
          placeHolder='Doe' magic={this.magic('lastName')} /></div>
      <div className='col-sm-3'><TextInput displayName='N Number'
          placeHolder='123456789' magic={this.magic('nNumber')} /></div>
      <div className='col-sm-3 col-md-3'><TextInput displayName='Box Number'
          placeHolder='123' magic={this.magic('boxNumber')} /></div>

      <div className='col-sm-3'>
      <SelectInput displayName='Semester' magic={this.magic('semester')}>
        <SelectOption value='' display='Select One' />
        <SelectOption value='Spring' display='Spring' />
        <SelectOption value='Fall' display='Fall' />
      </SelectInput></div>
      <div className='col-sm-3'><TextInput displayName='Contract Year'
          magic={this.magic('contractYear')} /></div>
      <div className='col-sm-3'>
      <SelectInput displayName='Study Location'
          magic={this.magic('studyLocation')}>
        <SelectOption value='' display='Select One' />
        <SelectOption value='On Campus' display='On Campus' />
        <SelectOption value='Off Campus' display='Off Campus' />
      </SelectInput></div>
      <div className='col-sm-3'>
        <TextInput displayName='Expected Year of Graduation' placeHolder='never'
          magic={this.magic('expectedGradYear')} />
      </div>
      </div>


        <ClassesTable magic={this.magic('classes')}/>

        <TextArea displayName='Goals' placeHolder='live the good life'
            magic={this.magic('goals')} />
        <TextArea displayName='Certification Criteria'
            placeHolder='Three out of four credits.'
            magic={this.magic('certificationCriteria')} />
        <TextArea displayName='Description and Other Activities'
            placeHolder='skydive'
            magic={this.magic('descriptionsOtherActivities')} />

        <TextInput displayName='Advisor Name' placeHolder='Prezzy Oshea'
            magic={this.magic('advisorName')} />
      </form>
      <div id='display-pdf' />
      </div>
    );
  }
});

const ClassesTable = React.createClass({
  updateHandlerGenerator: function(index) {
    return ((value) => {
      let newState = this.props.magic.value.slice();
      newState[index] = value;
      const testerCallback = (x) => (x.courseCode || x.courseName
        || x.isInternship || x.instructorName );
      newState = resizeArray(newState, 4, 9, testerCallback, emptyClassData);
      this.props.magic.handleUpdate(newState);
    });
  },
  magic: function(index) {
    return {value: this.props.magic.value[index],
      handleUpdate: this.updateHandlerGenerator(index),
      id: this.props.magic.id+'.'+index};
  },
  handleChange: function(event) {
    this.props.magic.handleUpdate(event.target.value);
  },
  handleUpdate: function(newValue) {
    this.props.magic.handleUpdate(newValue);
  },
  render: function() {
    const classNodes = this.props.magic.value.map(
      ((_, i) => (<Class number={i} magic={this.magic(i)} key={i}/>))
    );
    return (
      <div className='table-responsive'>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Course #</th>
            <th>Course name</th>
            <th>Internship</th>
            <th>Session</th>
            <th>Instructor Name</th>
          </tr>
        </thead>
        <tbody>
          {classNodes}
        </tbody>
      </table>
      </div>
    );
  }
});

const Class = React.createClass({
  updateHandlerGenerator: function(identifier) {
    return ((value) => {
      const newState = classDataFrom(this.props.magic.value);
      newState[identifier] = value;
      this.props.magic.handleUpdate(newState);
    });
  },
  magic: function(identifier) {
    return {value: this.props.magic.value[identifier],
      handleUpdate: this.updateHandlerGenerator(identifier),
      id: this.props.magic.id+'.'+identifier};
  },
  render: function() {
    return (
      <tr>
        <td>
          <TextInput placeHolder='12345' magic={this.magic('courseCode')}/>
        </td>
        <td><TextInput placeHolder='Basket-weaving 101'
            magic={this.magic('courseName')}/> </td>
        <td><CheckBox magic={this.magic('isInternship')}/></td>
        <td><SelectInput displayName='' magic={this.magic('sessionName')}>
          <SelectOption value='' display='Select One' />
          <SelectOption value='A' display='Full Term' />
          <SelectOption value='M1' display='Module 1' />
          <SelectOption value='M2' display='Module 2' />
          <SelectOption value='1MC' display='Full Term For Module Credit' />
        </SelectInput></td>
        <td><TextInput placeHolder='President #trublu'
            magic={this.magic('instructorName')}/></td>
      </tr>
    );
  }
});

const GenericInput = React.createClass({
  render: function() {
    // We want to hide the label when displayName is empty
    const style = this.props.hasOwnProperty('displayName') &&
      (this.props.displayName && this.props.displayName.length !== 0) ?
      {} : {display: 'none'};
    return (
      <span>
        <label htmlFor={this.props.htmlId} style={style}>
          {this.props.displayName}
        </label>
        {this.props.children}
      </span>
    );
  }
});

const TextInput = React.createClass({
  render: function() {
    const htmlId = this.props.magic.id;
    return (
      <GenericInput displayName={this.props.displayName} htmlId={htmlId}>
        <input
          type='text'
          value={this.props.magic.value}
          onChange={(e) => {this.props.magic.handleUpdate(e.target.value);}}
          placeholder={this.props.placeHolder}
          id={htmlId}
          className='form-control'
        />
      </GenericInput>
    );
  }
});

const TextArea = React.createClass({
  render: function() {
    const htmlId = this.props.magic.id;
    return (
      <GenericInput displayName={this.props.displayName} htmlId={htmlId}>
      <textarea
        value={this.props.magic.value}
        onChange={(e) => {this.props.magic.handleUpdate(e.target.value);}}
        placeholder={this.props.placeHolder}
        id={htmlId}
        className='form-control'
      />
      </GenericInput>
    );
  }
});

const CheckBox = React.createClass({
  render: function() {
    const htmlId = this.props.magic.id;
    return (
      <GenericInput displayName={this.props.displayName} htmlId={htmlId}>
      <input
        type='checkbox'
        checked={this.props.magic.value}
        onChange={(e) => {this.props.magic.handleUpdate(e.target.checked);}}
        id={htmlId}
        className='form-control'
      />
      </GenericInput>
    );
  }
});

const SelectInput = React.createClass({
  render: function() {
    const htmlId = this.props.magic.id;
    return (
      <GenericInput displayName={this.props.displayName} htmlId={htmlId}>
        <select
          type='checkbox'
          value={this.props.magic.value}
          onChange={(e) => {this.props.magic.handleUpdate(e.target.value);}}
          id={htmlId}
          className='form-control'
        >
        {this.props.children}
        </select>
      </GenericInput>
    );
  }
});

const SelectOption = React.createClass({
  render: function() {
    return (
      <option value={this.props.value} selected={this.props.selected}>
        {this.props.display}
      </option>
    );
  }
});

const BasicComponent = React.createClass({
  render: function() {
    return (
      null
    );
  }
});

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

ReactDOM.render(
  <FullPage />,
  document.getElementById('content')
);
