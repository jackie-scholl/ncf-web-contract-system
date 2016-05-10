//var contractId = $("#contract-id").text();

//console.log("contract id: " + contractId);

var FullPage = React.createClass({
	getInitialState: function() {
		console.log("window.location.hash: "+window.location.hash);
		var h = window.location.hash;
		if (h === null || h.length === 0) {
			return {contractId: null};
		} else {
			return {contractId: window.location.hash.slice(1)};
		}
	},
	changeContractId: function(contractId) {
		window.location.hash = '#' + contractId;
		this.setState({contractId: contractId});
	},
	render: function() {
		var optionalContract = null;
		if (this.state.contractId != null) {
			optionalContract = <ContractBox contractId={this.state.contractId} pollInterval={20000} />
		}
		return (
			<div>
				<ContractList changeContractId={this.changeContractId} pollInterval={200000} />
				{optionalContract}
			</div>
		);
	}
});

var ContractList = React.createClass({
	getInitialState: function() {
		return {
			contracts: []
		};
	},
	loadContractsFromServer: function() {
		$.getJSON("/api/contracts",
			{},
			(data) => {
				console.log(data);
				data.contracts.sort((a, b) => b.dateLastModified - a.dateLastModified);
				this.setState({contracts: data.contracts});
			}
		);
	},
	createContract: function(e) {
		e.preventDefault();
		$.post("/api/contracts",
			(data) => {
				console.log(data);
				this.props.changeContractId(data.contractId);
			}
		);
	},
	componentDidMount: function() {
		//this.setState({firstName: "Jane"});
    this.loadContractsFromServer();
    setInterval(this.loadContractsFromServer, this.props.pollInterval);
  },
	render: function() {
		var contracts = this.state.contracts.map((x) =>
				(<ContractElement value={x} key={x.contractId}
							changeContractId={this.props.changeContractId} />));
		return (
			<div className="contractList left-sidebar">
				<h1>Contract List</h1>
			  <a href="" onclick={this.createContract} id="new-contract-link" class="logged-in">New Contract</a>
				<ul>
					{contracts}
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
		var classes = this.props.value.contractData.classes.map((x, _1, _2) =>
					(x.courseName)).filter((x, _1, _2) => (x !== ""));
		if (classes.length > 0) {
			classesString = "[" + classes.join() + "]; ";
		}
		return (
			<li id={this.props.value.contractId}>
				<a href={"#" + this.props.value.contractId} onClick={this.handleClick}>
					{this.props.value.contractData.semester + " "}
					{this.props.value.contractData.contractYear + "; "}
					{classesString}
					last modified {timeSince(new Date(this.props.value.dateLastModified))} ago
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
	return Math.floor(seconds) + " seconds";
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
	//console.log("index of last class with data: " + i);
	var newLength = i + 2; // there should be exactly one empty element at the end of the array
	//console.log("new length: " + newLength);
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
			//console.log("adding a thing");
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
	render: function() {
		return (
			<div className="contractBox main">
				<h2>Contract Form</h2>
				<ContractForm pollInterval = {this.props.pollInterval} contractId={this.props.contractId}/>
			</div>
		);
	}
});

var ContractForm = React.createClass({
	getInitialState: function() {
		return {
			semester: '', studyLocation: '', contractYear: '',
			firstName: '', lastName: '', nNumber: '', expectedGradYear: '', boxNumber: '',
			classes: []
		};
	},
	updateHandlerGenerator: function(identifier) {
		return ((value) => {
			var newState = {};
			newState[identifier] = value;
			this.setState(newState);
			setTimeout(this.updateTrigger, 10);
		});
	},
	updateTrigger: function() {
		console.log(this.state);
		console.log(JSON.stringify(this.state));
		$.post('/contracts/'+this.props.contractId+'/save2',
			{data: JSON.stringify(this.state)},
			(data) => {
				console.log("Saved to server");
				this.updatePDF();
			}
		);
	},
	updatePDF: function() {
		var options = {
			 width: "100%",
			 height: "830px"
		};
		PDFObject.embed('/contracts/'+this.props.contractId+'/pdf', $("#display-pdf"), options);
	},
	loadContractFromServer: function() {
		console.log('/api/contracts/'+this.props.contractId);
		$.getJSON('/api/contracts/'+this.props.contractId,
			{},
			(data) => {
				console.log("Recieved contract entry from server");
				this.setState(data.contract.contractData);
				this.updatePDF();
				setTimeout(() => {console.log(this.state);}, 10);
			}
		);
	},
  componentDidMount: function() {
		//this.setState({firstName: "Jane"});
    this.loadContractFromServer();
    setInterval(this.loadContractFromServer, this.props.pollInterval);
  },
	magic: function(identifier) {
		return {value: this.state[identifier], handleUpdate: this.updateHandlerGenerator(identifier)};
	},
	render: function() {
		var contractYearNodes = Array.apply(null, Array(5)).map(function (_, i) {return i;});

		return (
			<div className="contractForm">
			<form id="contractForm" class="blank-form"
						action={"/contracts/"+this.props.contractId+"/save"}>
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
				<TextInput displayName="First Name" placeHolder="Jane" magic={this.magic('firstName')} />
				<TextInput displayName="Last Name" placeHolder="Doe" magic={this.magic('lastName')} />
				<TextInput displayName="N Number" placeHolder="123456789" magic={this.magic('nNumber')} />
				<TextInput displayName="Expected Year of Graduation" placeHolder="never"
							magic={this.magic('expectedGradYear')} />
				<TextInput displayName="Box Number" placeHolder="123" magic={this.magic('boxNumber')} />
				<TextArea displayName="Goals" placeHolder="live the good life" magic={this.magic('goals')} />
				<ClassesTable magic={this.magic('classes')}/>
				<TextArea displayName="Certification Criteria"
							placeHolder="Three out of four credits."
							magic={this.magic('certificationCriteria')} />
				<TextArea displayName="Description and Other Activities" placeHolder="skydive"
							magic={this.magic('descriptionsOtherActivities')} />
				<TextInput displayName="Advisor Name" placeHolder="God" magic={this.magic('advisorName')} />
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
			/*console.log(newState.length);
			for (var i = newState.length-1; i >= 0; i--) {
				var x = newState[i];
				console.log(x);
				var hasData = (x.courseCode !== '' || x.courseName !== ''
					|| x.isInternship == true || x.instructorName !== '');
				if (hasData) {
					break;
				}
			}
			var newLength = i + 2;*/
			var testerCallback = (x) => (x.courseCode !== "" || x.courseName !== ""
				|| x.isInternship == true || x.instructorName !== "");
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
			<table class="classes-table">
				<thead>
					<tr>
						<th>Course</th>
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
				<td><TextInput2 placeHolder="President trublu"
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
		return (
			<div>
				{this.props.displayName}:
				<input
					type="text"
					value={this.props.magic.value}
					onChange={this.handleChange}
					placeholder={this.props.placeHolder}
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
		return (
			<div>
				{this.props.displayName}:
				<textarea
					value={this.props.magic.value}
					onChange={this.handleChange}
					placeholder={this.props.placeHolder}
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
		return (
			<span>
			  {this.props.displayName}
				<select
					value={this.props.magic.value}
					onChange={this.handleChange}
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

var DisplayPDF = React.createClass({
	render: function() {
		return (
			<embed src={this.props.source} width="500" height="375" type='application/pdf' align='center' />
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
