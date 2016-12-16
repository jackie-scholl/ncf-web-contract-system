//Copyright 2016 Jackie Scholl
'use strict';
const React = require('react');
const ReactDOM = require('react-dom');
const loginHandler = require('./login.js').render();
const contractStorageCognito = require('./contract-storage-cognito');
const ContractEntry = require('./contract-entry.js').ContractEntry;
const timeSince = require('./utility.js').timeSince;
const resizeArray = require('./utility.js').resizeArray;
const classes_search = require('./class-search.js').search;

/** This contains the entire page of content. */
const FullPage = React.createClass({
  /** Called at initial creation. */
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
  /** Called when we switch to a new/different contract. */
  changeContractId: function(contractId) {
    /* This line updates the "hash" in the URL bar so users can bookmark. */
    window.location.hash = '#' + contractId;
    this.setState({contractId: contractId});
  },
  /** Creates a new contract entry and sets as current. Called when user presses
      "new contract" button. */
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
  /** Syncs local content with remote server. Called manually by user. */
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
            handleUpdate={this.state.contractStorageHandler.setContractEntry
                            .bind(this.state.contractStorageHandler)}
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

/** The sidebar that allows you to pick a contract to work on. */
const ContractList = React.createClass({
  /** Handles the "new contract" button. Just calls the new contract function
      from FullPage. */
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


/** Represents an individual clickable contract in the contract list. */
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

/** Creates an object that holds data about a class. We need to stop using
    this and start using the one from contract-entry.js */
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

/** Copies a given ClassData object. */
const classDataFrom = function(data) {
  return new ClassData(data.courseCode, data.courseName, data.isInternship,
        data.instuctorName, data.sessionName);
};

/** This part of the page shows the contract the user is working on. It includes
    the form section and the live PDF preview. */
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

/** The live preview of the PDF. We will need to to alter this to avoid binary
    stuff when working with Lambda + API Gateway. */
const LivePreview = React.createClass({
  render: function() {
    const renderContractRequest = {
      contractData: this.props.value.contractData,
      authentication: this.props.logins,
      options: {
        flatten_pdf: true
      }
    };

    let baseURL = '';
    if (location.host ===
          'contract-system-static.s3-website-us-east-1.amazonaws.com') {
      // If we are hosted on AWS, then use Heroku for PDF
      baseURL = 'https://ncf-web-contract-system.herokuapp.com';
    }
    const requestJson = JSON.stringify(renderContractRequest);
    const contractPdfUrl = baseURL + '/render-contract?renderContractRequest='
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

/** This section of the page hosts the contract form, allowing users to view and
    edit the state of the contract.*/
const ContractForm = React.createClass({
  updateHandlerGenerator: function(identifier) {
    return ((value) => {
      const newState = Object.assign({}, this.props.value);
      newState[identifier] = value;
      this.props.handleUpdate(newState);
    });
  },

  /** TODO: I really do need to explain these magic functions at some point. */
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
      </div>
    );
  }
});

const ClassesTable = React.createClass({
  normalizeArray: function(array) {
    const testerCallback = (x) => (x.courseCode || x.courseName
      || x.isInternship || x.instructorName );
    return resizeArray(array, 4, 9, testerCallback, emptyClassData);
  },
  updateHandlerGenerator: function(index) {
    return ((value) => {
      let newState = this.props.magic.value.slice();
      newState[index] = value;
      newState = this.normalizeArray(newState);
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
  addClass: function(classObj) {
    let newState = this.props.magic.value.slice();
    const classData = {courseCode: classObj.code, courseName: classObj.title,
      isInternship: false, instructorName: classObj.instructor,
      sessionName: 'A'};
    newState.splice(0, 0, classData);
    newState = this.normalizeArray(newState);
    this.handleUpdate(newState);
  },
  render: function() {
    const classNodes = this.props.magic.value.map(
      ((_, i) => (<Class number={i} magic={this.magic(i)} key={i}/>))
    );
    return (
      <div>
      <SearchBar magic={this.magic('search')} addClass={this.addClass} />
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
      </div>
    );
  }
});

const SearchBar = React.createClass({
  getInitialState: function() {
    return {query: '', results: []};
  },
  handleUpdate: function(newValue) {
    //console.log('new value: ' + newValue);
    this.setState({query: newValue});
    classes_search(newValue).then((results) => {
      //console.log(results);
      this.setState({results: results});
    }).catch((err) => {
      console.log('err: ' + err);
    });
  },
  render: function() {
    const htmlId = this.props.magic.id;
    const results = this.state.results.map((el) => (
      <SearchResult value={el} key={el.ref}
        selectClass={() => {this.props.addClass(el.source);}}/>
    ));
    return (
      <div>
        <input
        type='text'
        onChange={(e) => {this.handleUpdate(e.target.value);}}
        placeholder='Search for Classes'
        id={htmlId}
        className='form-control'
        />
        <div className='result-box2'>
          {results}
        </div>
      </div>
    );
  }
});

const SearchResult = React.createClass({
  render: function() {
    return (
      <div className='suggestion'>
        <div className='summary'>
          <button className='btn btn-default' type='button'
              onClick={this.props.selectClass}>
            {this.props.value.source.title}
          </button>
        </div>
        <ul className='detail'>
          <li> Course Code: {this.props.value.source.code} </li>
          <li> Instructor: {this.props.value.source.instructor} </li>
          <li> {this.props.value.source.description} </li>
        </ul>
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
