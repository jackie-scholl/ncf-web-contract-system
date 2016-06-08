//var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var base64 = require('base64-js');

//const apiRoot = '';

const googleLogin = false;

var FullPage = React.createClass({
	getInitialState: function() {
		console.log("window.location.hash: "+window.location.hash);
		const h = window.location.hash;
		//console.log(h);
		const contractId = h? h.slice(1) : null;
		const contractDataset = null;
		return {contractId: contractId, contractDataset: null, contractMap: new Map(), logins: {}};
	},
	cognitoSetup: function() {
		const logins = gIdToken ? {'accounts.google.com': gIdToken} : {};
		this.setState({logins: logins});
		//console.log(logins);
		const y = this;
		//console.log('gid: '+gIdToken);
		// Initialize the Amazon Cognito credentials provider
		AWS.config.region = 'us-east-1'; // Region
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    	IdentityPoolId: 'us-east-1:a09f9758-c1f2-44c1-a3c8-185219e42c99', logins
			/*Logins: { // optional tokens, used for authenticated login
		    'accounts.google.com': gIdToken
		  }*/
		});
		AWS.config.credentials.get(function(){
   		var syncClient = new AWS.CognitoSyncManager();
   		syncClient.openOrCreateDataset('contracts', function(err, dataset) {
				if (err) {
					console.log('could not open or create dataset; err '+err);
				} else {
					console.log('dataset opened');
					y.setState({contractDataset: dataset});
					y.initContractMap();
				}
   		});
		});
	},
	cognitoSync: function() {
		if (!this.state.contractDataset) {
			console.log('dataset is null! oh noes!');
		} else {
			//alert('oh, no no no! we\'re not paying for real sync yet');
			this.state.contractDataset.synchronize({
				onFailure: (err) => {console.log(err);},
				onSuccess: (success) => {console.log(success);}
			});
		}
	},
	initContractMap: function() {
		if (!this.state.contractDataset) {
			alert('something went wrong; initContractMap called but dataset does not exist');
		} else {
			this.state.contractDataset.getAll((err, map) => {
				if (err) {
					console.log('error getting contracts');
					console.warn('error getting contracts');
				} else {
					const objectMap = new Map();
					for (var x in map) {
						if (map.hasOwnProperty(x) && map[x]) {
							if (map[x] == {"firstName": "SuperLongnameh"} || x == "") {
								console.log(x);
								console.log(map[x]);
								console.log("uh oh, very bad value");
							} else {
								objectMap.set(x, JSON.parse(map[x]));
							}
            }

					}
					//console.log('object map:');
					//console.log(objectMap);
					this.setState({contractMap: objectMap});
				}
			});
		}
	},
	setContractEntry: function(contractEntry) {
		if (!this.state.contractDataset) {
			alert('oops! dataset doesn\'t exist yet');
		} else {
			const contractString = JSON.stringify(contractEntry);
			this.state.contractDataset.put(contractEntry.contractId, contractString,
				() => {this.initContractMap();}
			);
		}
	},
	componentDidMount: function() {
		if (googleLogin) {
			if (gIdToken) {
				console.log('token already exists!');
				this.cognitoSetup();
			} else {
				const y = this;
				$(document).on("googleLogin", function(e){
					y.cognitoSetup();
				});
			}
		} else {
			this.cognitoSetup();
		}
  },
	changeContractId: function(contractId) {
		window.location.hash = '#' + contractId;
		this.setState({contractId: contractId});
	},
	handleContractListUpdate: function(contracts) {
		if (this.state.contractId === null && contracts.length > 0) {
			this.changeContractId(contracts[0].contractId);
		}
	},
	handleContractBoxUpdate: function(newContractEntry) {
		this.setContractEntry(newContractEntry);
	},
	createContract: function() {
		var array = new Uint8Array(15);
		window.crypto.getRandomValues(array);
		const contractId = base64.fromByteArray(array).replace(/\+/, '_').replace(/\//, '-');
		console.log(contractId);
		//const contractId = 5;
		const baseContractData = {
			semester: '', studyLocation: '', contractYear: '',
			firstName: '', lastName: '', nNumber: '', expectedGradYear: '', boxNumber: '',
			classes: [{courseCode: '', courseName: '', isInternship: '', instructorName: '',
						sessionName: ''}]
		};
		const contractEntry = {contractId: contractId, googleId: 'nah',
				contractData: baseContractData, dateLastModified: new Date().getTime()};
		console.log(contractEntry);
		this.setContractEntry(contractEntry);
		this.changeContractId(contractId);
	},
	render: function() {
		var optionalContract = null;
		if (this.state.contractId != null && this.state.contractMap.has(this.state.contractId)) {
			optionalContract =
					<ContractBox
						contractEntry={this.state.contractMap.get(this.state.contractId)}
						handleUpdate={this.handleContractBoxUpdate}
						logins={this.state.logins}
						pollInterval={2000}
					/>
		}
		//console.log('current id: '+this.state.contractId);
		return (
			<div className="container-fluid">
	      <div className="row">
					<ContractList changeContractId={this.changeContractId}
						onUpdate={this.handleContractListUpdate}
						createContract={this.createContract}
						currentContractId={this.state.contractId}
						contractMap={this.state.contractMap}
						putContract={this.handleContractFormUpdate}
						pollInterval={2000}
					/>
					{optionalContract}
				</div>
			</div>
		);
	}
});

var ContractList = React.createClass({
	createContract: function(e) {
		e.preventDefault();
		this.props.createContract();
	},
	render: function() {
		var contractEntries = [...this.props.contractMap.values()]
				.sort((a, b) => b.dateLastModified - a.dateLastModified)
				.map((x) =>
					(<ContractElement value={x} key={x.contractId}
							changeContractId={this.props.changeContractId}
							isCurrent={x.contractId === this.props.currentContractId}/>));
		return (
			<div className="col-sm-3 col-md-2 sidebar">
				<ul className="nav nav-sidebar">
					<li>Contract List</li>
					<li><a href="" onClick={this.createContract} id="new-contract-link" className="logged-in">New Contract</a></li>
				</ul>
	      <ul className="nav nav-sidebar">
					{contractEntries}
				</ul>
			</div>
		);
	}
});

var ContractElement = React.createClass({
	handleClick: function(e) {
		e.preventDefault();
		this.props.changeContractId(this.props.value.contractId);
	},
	render: function() {
		var classesString = "";
		const classes = this.props.value.contractData.classes.map((x, _1, _2) =>
					(x.courseName)).filter((x, _1, _2) => (x !== ""));
		if (classes.length > 0) {
			classesString = "[" + classes.join().substring(0, 15) + "]; ";
		}
		const wholeString = this.props.value.contractData.semester + " " +
				this.props.value.contractData.contractYear + "; " +
				classesString + '' +
				timeSince(new Date(this.props.value.dateLastModified)) + ' ago';
		return (
			<li id={this.props.value.contractId} className={this.props.isCurrent?'active':''}>
				<a href={"#" + this.props.value.contractId} onClick={this.handleClick}>
					{wholeString}
				</a>
			</li>
		);
	}
});

function timeSince(date) {
	var seconds = Math.floor((new Date() - date) / 1000);
	var interval = Math.floor(seconds / 31536000);
	if (interval > 1) {
		return interval + " years";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes";
	}
	return "just now";
	//return Math.floor(seconds) + " seconds";
}

function ClassData(courseCode, courseName, isInternship, instructorName, sessionName) {
	console.assert(isInternship === true || isInternship === false, "bad value: " + isInternship);
	return {courseCode: courseCode, courseName: courseName, isInternship: isInternship,
			instructorName: instructorName, sessionName: sessionName};
}

var emptyClassData = function() {
	return new ClassData('', '', false, '', '');
}

var classDataFrom = function(data) {
	console.log("About to pull class data");
	console.log(data);
	return new ClassData(data.courseCode, data.courseName, data.isInternship,
				data.instuctorName, data.sessionName);
}

var resizeArray = function(array, minSize, maxSize, testerCallback, spaceFillerCallback) {
	//console.log("existing array length: "+array.length);
	for (var i = array.length-1; i >= 0; i--) {
		var x = array[i];
		var hasData = testerCallback(x);
		if (hasData) {
			console.log(x);
			break;
		}
	}
	console.log("index of last class with data: " + i);
	var newLength = i + 2; // there should be exactly one empty element at the end of the array
	if (newLength > maxSize) {
		newLength = maxSize;
	}
	if (newLength < minSize) {
		newLength = minSize;
	}
	if (array.length == newLength) {
		// we're good!
	} else if (array.length > newLength) {
		array = array.slice(0, newLength);
	} else if (array.length < newLength) {
		while (array.length < newLength) {
			array = array.concat(spaceFillerCallback());
		}
	}
	return array;
}

var testResizeArray = function() {
	var zeroTester = (x) => (x != 0);
	var zeroFiller = () => (0);
	console.assert(arraysEqual(resizeArray([0, 0, 1, 0, 0, 0], 0, 100, zeroTester,
				zeroFiller), [0, 0, 1, 0]));
	console.assert(arraysEqual(resizeArray([1, 0, 0, 6], 0, 100, zeroTester,
				zeroFiller), [1, 0, 0, 6, 0]));
}

testResizeArray();

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

var ContractBox = React.createClass({
	handleUpdate: function(newData) {
		//console.log("handling contract box update. newData: ");
		//console.log(newData);
		var updatedContractEntry = Object.assign({}, this.props.contractEntry);
		updatedContractEntry.contractData = newData;
		updatedContractEntry.dateLastModified = new Date().getTime();
		//console.log(updatedContract);
		this.props.handleUpdate(updatedContractEntry);
	},
	render: function() {
		console.log(this.props.contractEntry);
		return (
			<div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
				<ContractForm pollInterval={this.props.pollInterval}
					contractId={this.props.contractEntry.contractId}
					value={this.props.contractEntry.contractData}
					handleUpdate={this.handleUpdate}
				/>
				<LivePreview value={this.props.contractEntry} logins={this.props.logins} />
			</div>
		);
	}
});

var LivePreview = React.createClass({
	render: function() {
		const renderContractRequest = {
			contractData: this.props.value.contractData,
			authentication: this.props.logins,
			options: {
				flatten_pdf: true
			}
		}
		const requestJson = JSON.stringify(renderContractRequest);
		const contractPdfUrl = "/render-contract?renderContractRequest="+requestJson;
		return (
			<iframe src={contractPdfUrl} width="100%" height="1000px">
				<a href={contractPdfUrl}>
					Click here to see PDF
				</a>
			</iframe>
		);
	}
});


var ContractForm = React.createClass({
	updateHandlerGenerator: function(identifier) {
		return ((value) => {
			var newState = Object.assign({}, this.props.value);
			newState[identifier] = value;
			this.props.handleUpdate(newState);
		});
	},

	magic: function(identifier) {
		return {value: this.props.value[identifier],
			handleUpdate: this.updateHandlerGenerator(identifier)};
	},
	render: function() {
		var contractYearNodes = Array.apply(null, Array(5)).map((_, i) => (i));
		return (
			<div className="contractForm">
			<h1 className="page-header">Contract Form</h1>
			<form id="contractForm" class="blank-form">
				<SelectInput displayName="Semester" magic={this.magic('semester')}>
					<SelectOption value="" display="Select One" />
					<SelectOption value="Spring" display="Spring" />
					<SelectOption value="Fall" display="Fall" />
				</SelectInput>
			<TextInput displayName="Year" magic={this.magic('contractYear')} />
				<SelectInput displayName="Study Location" magic={this.magic('studyLocation')}>
					<SelectOption value="" display="Select One" />
					<SelectOption value="On Campus" display="On Campus" />
					<SelectOption value="Off Campus" display="Off Campus" />
				</SelectInput>
				<TextInput displayName="First Name" placeHolder="Jane"
							magic={this.magic('firstName')} />
				<TextInput displayName="Last Name" placeHolder="Doe"
							magic={this.magic('lastName')} />
				<TextInput displayName="N Number" placeHolder="123456789"
							magic={this.magic('nNumber')} />
				<TextInput displayName="Expected Year of Graduation" placeHolder="never"
							magic={this.magic('expectedGradYear')} />
				<TextInput displayName="Box Number" placeHolder="123"
							magic={this.magic('boxNumber')} />
				<TextArea displayName="Goals" placeHolder="live the good life"
							magic={this.magic('goals')} />
				<ClassesTable magic={this.magic('classes')}/>
				<TextArea displayName="Certification Criteria"
							placeHolder="Three out of four credits."
							magic={this.magic('certificationCriteria')} />
				<TextArea displayName="Description and Other Activities"
							placeHolder="skydive"
							magic={this.magic('descriptionsOtherActivities')} />
				<TextInput displayName="Advisor Name" placeHolder="Prezzy O'shea"
							magic={this.magic('advisorName')} />
			</form>
			<div id="display-pdf" />
			</div>
		);
	}
});

var ClassesTable = React.createClass({
	updateHandlerGenerator: function(index) {
		return ((value) => {
			var newState = this.props.magic.value.slice();
			newState[index] = value;
			var testerCallback = (x) => (x.courseCode || x.courseName
				|| x.isInternship || x.instructorName );
			var testerCallback2 = (x) => (x.courseName !== "");
			newState = resizeArray(newState, 4, 9, testerCallback, emptyClassData);
			this.props.magic.handleUpdate(newState);
		});
	},
	magic: function(index) {
		return {value: this.props.magic.value[index], handleUpdate: this.updateHandlerGenerator(index)};
	},
	handleChange: function(event) {
		this.props.magic.handleUpdate(event.target.value);
	},
	handleUpdate: function(newValue) {
		this.props.magic.handleUpdate(newValue);
	},
	render: function() {
		var magic_x = this.magic
		var classNodes = this.props.magic.value.map(function(clazz, i) {
			return (
				<Class number={i} magic={magic_x(i)} key={i}/>
			);
		});
		return (
			<div className="table-responsive">
			<table className="table table-striped">
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

var Class = React.createClass({
	updateHandlerGenerator: function(identifier) {
		return ((value) => {
			var newState = classDataFrom(this.props.magic.value);
			console.log("identifier: " + identifier+"; value: "+value);
			newState[identifier] = value;
			console.log("new class state: ");
			console.log(newState);
			this.props.magic.handleUpdate(newState);
		});
	},
	magic: function(identifier) {
		return {value: this.props.magic.value[identifier],
					handleUpdate: this.updateHandlerGenerator(identifier)};
	},
	render: function() {
		var row = this.props.number;
		return (
			<tr>
				<td><TextInput2 placeHolder="12345" magic={this.magic("courseCode")}/></td>
				<td><TextInput2 placeHolder="Basket-weaving 101"
						magic={this.magic("courseName")}/> </td>
				<td><CheckBox2 magic={this.magic("isInternship")}/></td>
				<td><SelectInput displayName="" magic={this.magic("sessionName")}>
					<SelectOption value='' display='Select One' />
					<SelectOption value='A' display='Full Term' />
					<SelectOption value='M1' display='Module 1' />
					<SelectOption value='M2' display='Module 2' />
					<SelectOption value='1MC' display='Full Term For Module Credit' />
				</SelectInput></td>
				<td><TextInput2 placeHolder="President #trublu"
						magic={this.magic("instructorName")}/></td>
			</tr>
		);
	}
});

var TextInput = React.createClass({
	handleChange: function(event) {
		this.props.magic.handleUpdate(event.target.value);
	},
	render: function() {
		// We want to hide the label when displayName is empty
		const hasDisplayName = (this.props.displayName || this.props.displayName.length !== 0);
		const displayStyle = hasDisplayName? 'inherit' : 'none';
		return (
			<div class="form-group">
				<label htmlFor={this.props.displayName} style={{display: displayStyle}}>
					{this.props.displayName}
				</label>
				<input
					type="text"
					value={this.props.magic.value}
					onChange={this.handleChange}
					placeholder={this.props.placeHolder}
					className='form-control'
				/>
			</div>
		);
	}
});

var TextArea = React.createClass({
	handleChange: function(event) {
		this.props.magic.handleUpdate(event.target.value);
	},
	render: function() {
		// We want to hide the label when displayName is empty
		const hasDisplayName = (this.props.displayName || this.props.displayName.length !== 0);
		const displayStyle = hasDisplayName? 'inherit' : 'none';
		return (
			<div>
				<label htmlFor={this.props.displayName} style={{display: displayStyle}}>
					{this.props.displayName}
				</label>
				<textarea
					value={this.props.magic.value}
					onChange={this.handleChange}
					placeholder={this.props.placeHolder}
					className='form-control'
					id={this.props.displayName}
				/>
			</div>
		);
	}
});

var TextInput2 = React.createClass({
	handleChange: function(event) {
		this.props.magic.handleUpdate(event.target.value);
	},
	render: function() {
		return (
			<span>
				<input
					type="text"
					value={this.props.magic.value}
					onChange={this.handleChange}
					placeholder={this.props.placeHolder}
					className="form-control"
				/>
			</span>
		);
	}
});

var CheckBox2 = React.createClass({
	handleChange: function(event) {
		this.props.magic.handleUpdate(event.target.checked);
	},
	render: function() {
		return (
			<span>
				<input
					type="checkbox"
					checked={this.props.magic.value}
					onChange={this.handleChange}
					placeholder={this.props.placeHolder}
					className="form-control"
				/>
			</span>
		);
	}
});

var SelectInput = React.createClass({
	handleChange: function(event) {
		this.props.magic.handleUpdate(event.target.value);
	},
	render: function() {
		// We want to hide the label when displayName is empty
		const hasDisplayName = (this.props.displayName || this.props.displayName.length !== 0);
		const displayStyle = hasDisplayName? 'inherit' : 'none';
		return (
			<span>
				<label htmlFor={this.props.displayName} style={{display: displayStyle}}>
					{this.props.displayName}
				</label>
				<select
					value={this.props.magic.value}
					onChange={this.handleChange}
					className="form-control"
					id={this.props.displayName}
				>
				{this.props.children}
				</select>
			</span>
		);
	}
});

var SelectOption = React.createClass({
	render: function() {
		return (
			<option value={this.props.value} selected={this.props.selected}>
				{this.props.display}
			</option>
		);
	}
});

var BasicComponent = React.createClass({
	render: function() {
		return (
			null
		);
	}
});

ReactDOM.render(
	<FullPage />,
	document.getElementById('content')
);
