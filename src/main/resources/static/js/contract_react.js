var contractId = $("#contract-id").text();

console.log("contract id: " + contractId);

var ContractBox = React.createClass({
	render: function() {
		return (
			<div className="contractBox">
				<h2>Contract Form</h2>
				<ContractForm pollInterval = {this.props.pollInterval} />
			</div>
		);
	}
});

function ClassData(courseCode, courseName, isInternship, instructorName, sessionName) {
	console.assert(isInternship === true || isInternship === false, "bad value: " + isInternship);
	return {courseCode: courseCode, courseName: courseName, isInternship: isInternship,
			instuctorName: instructorName, sessionName: sessionName};
}

var emptyClassData = function() {
	return new ClassData('', '', false, '', '');
}

var classDataFrom = function(data) {
	console.log("About to pull class data");
	console.log(data);
	return new ClassData(data.courseCode, data.courseName, data.isInternship, data.instuctorName, data.sessionName);
}

var ContractForm = React.createClass({
	getInitialState: function() {
		var defaultYear = new Date().getFullYear();
		var month = new Date().getMonth();
		var defaultSemester = '';
		if (month == 7 || month == 8) {
			// month is August or September, assume Fall semester
			defaultSemester = 'Fall';
		} else if (month == 0 || month == 1) {
			// month is January or February, assume Spring semester
			defaultSemester = 'Spring';
		}
		//var defaultClass = {courseCode: '', courseName: '', isInternship: false,
		//		instuctorName: '', sessionName: ''};
		//var defaultClass = ClassData('', '', false, '', '');
		var defaultClass = emptyClassData();
		console.log(defaultClass);
		return {
			semester: defaultSemester, studyLocation: '', contractYear: defaultYear,
			firstName: '', lastName: '', nNumber: '', expectedGradYear: '', boxNumber: '',
			classes: [defaultClass, defaultClass, defaultClass, defaultClass]
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
		$.post('/contracts/'+contractId+'/save2',
			{data: JSON.stringify(this.state)},
			(data) => {
				console.log("Saved to server");
				var options = {
				   width: "100%",
				   height: "1140px"
				};
				PDFObject.embed('/contracts/'+contractId+'/pdf', $("#display-pdf"), options);
			}
		);
	},
	loadContractFromServer: function() {
		$.getJSON('/api/contracts/'+contractId,
			{},
			(data) => {
				console.log("Recieved contract entry from server");
				this.setState(data.contract.contractData);
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
	resetState: function() {
		console.log("About to reset state");
		console.log(this.state);
		this.setState({firstName: 'Ja', lastName: 'Db'});
		console.log("State reset!");
		console.log(this.state);
	},
	render: function() {
		var contractYearNodes = Array.apply(null, Array(5)).map(function (_, i) {return i;});

		return (
			<div className="contractForm">
			<button onClick={this.resetState}>Reset state</button>
			<form id="contractForm" class="blank-form" action={"/contracts/"+this.props.contractId+"/save"}>
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
				<TextInput displayName="Expected Year of Graduation" placeHolder="never" magic={this.magic('expectedGradYear')} />
				<TextInput displayName="Box Number" placeHolder="123" magic={this.magic('boxNumber')} />
				<TextArea displayName="Goals" placeHolder="live the good life" magic={this.magic('goals')} />
				<ClassesTable magic={this.magic('classes')}/>
				<TextArea displayName="Certification Criteria" placeHolder="Three out of four credits." magic={this.magic('certificationCriteria')} />
				<TextArea displayName="Description and Other Activities" placeHolder="skydive" magic={this.magic('descriptionsOtherActivities')} />
				<TextInput displayName="Advisor Name" placeHolder="God" magic={this.magic('advisorName')} />
			</form>
			</div>
		);
	}
});

var ClassesTable = React.createClass({
	updateHandlerGenerator: function(index) {
		return ((value) => {
			var newState = this.props.magic.value.slice();
			newState[index] = value;
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
			<table class="classes-table"><tbody>
					<tr>
							<td><pre>Course	</pre></td>
							<td><pre>Course name	</pre></td>
							<td><pre>Internship	</pre></td>
							<td><pre>Session	</pre></td>
							<td><pre>Name of instructor/evaluator	</pre></td>
					</tr>
					{classNodes}
			</tbody></table>
		);
	}
});

var Class = React.createClass({
	updateHandlerGenerator: function(identifier) {
		return ((value) => {
			var newState = classDataFrom(this.props.magic.value);
			newState[identifier] = value;
			this.props.magic.handleUpdate(newState);
		});
	},
	magic: function(identifier) {
		return {value: this.props.magic.value[identifier], handleUpdate: this.updateHandlerGenerator(identifier)};
	},
	render: function() {
		var row = this.props.number;
		return (
			<tr>
				<td><TextInput2 placeHolder="12345" magic={this.magic("courseCode")}/> </td>
				<td><TextInput2 placeHolder="Basket-weaving 101" magic={this.magic("courseName")}/> </td>
				<td><CheckBox2 magic={this.magic("isInternship")}/></td>
				<td><SelectInput displayName="" magic={this.magic("sessionName")}>
					<SelectOption value='' display='Select One' />
					<SelectOption value='A' display='Full Term' />
					<SelectOption value='M1' display='Module 1' />
					<SelectOption value='M2' display='Module 2' />
					<SelectOption value='1MC' display='Full Term For Module Credit' />
				</SelectInput></td>
				<td><TextInput2 placeHolder="President #trublu" magic={this.magic("instructorName")}/></td>
			</tr>
		);
	}
});

/*
<SelectInput2 displayName="session2" magic={this.magic("sessionName")}
	options={[
		{value:'', display:'Select One'},
		{value:'A', display:'Full Term'},
		{value:'M1', display:'Module 1'},
		{value:'M2', display:'Module 2'},
		{value:'1MC', display:'Full Term For Module Credit'}
	]}
/>
*/

/*<SessionSelector magic={this.magic("sessionName")} />*/
/*var SessionSelector = React.createClass({
	render: function() {
		var indexToSelect = this.props.children.findIndex((x) => (x.props.value === this.props.magic.value), this);

		return (
			<SelectInput displayName="session" magic={this.props.magic}>
				<SelectOption value='' display='Select One' />
				<SelectOption value='A' display='Full Term' />
				<SelectOption value='M1' display='Module 1' />
				<SelectOption value='M2' display='Module 2' />
				<SelectOption value='1MC' display='Full Term For Module Credit' />
			</SelectInput>
		);
	}
});*/

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

var SelectInput2 = React.createClass({
	render: function() {
		var options = this.props.options.map((x, i) => (
			<SelectOption value={x.value} display={x.display} selected={x.value === this.props.magic.value} key={x.value} />
		));
		return (
			<SelectInput displayName={this.props.displayName} magic={this.props.magic}>
				{options}
			</SelectInput>
		);
	}
});

var SelectInput = React.createClass({
	handleChange: function(event) {
		this.props.magic.handleUpdate(event.target.value);
	},
	render: function() {
		//var indexToSelect = this.props.children.findIndex((x) => (x.props.value === this.props.magic.value), this);
		//console.log("displayName: "+this.props.displayName+"; value: "+this.props.magic.value+"; index: "+indexToSelect);
		//console.log(this.props.children[indexToSelect].props);
		//this.props.children[indexToSelect].props.selected = true;
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
			<option value={this.props.value} selected={this.props.selected}> {this.props.display} </option>
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
	<ContractBox pollInterval={10000} />,
	document.getElementById('content')
);
