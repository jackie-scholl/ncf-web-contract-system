/*onSignInExtra = function() {
	$.getJSON("/api/contracts", {
		// id_token : googleUser.getAuthResponse().id_token
	}, function(data) {
		console.log(data);
		showContracts(data.contracts);
	});
}*/

function loadContracts() {
	$.getJSON("/api/contracts", {}, (data) => {console.log(data); showContracts(data.contracts);});
}

function showContracts(contracts) {
	contracts.sort((a, b) => b.dateLastModified - a.dateLastModified);
	var items = contracts.map((x, _1, _2) => "<li id='" + x.contractId + "'>" + link(x) + "</li>")

	$("#content").html(
		$("<ul/>", {
			"class" : "my-new-list",
			html : items.join("")
		})
	);
}

/*
 * if (googleUser) { console.log("Google user exists!"); onSignInExtra(); }
 */

if (Cookies.get("id_token3")) {
	console.log("cookie exists!");
	loadContracts();
} else {
	onSignInExtra = loadContracts;
}

function link(entry) {
	var classesString = "";
	console.log(entry);
	var classes = entry.contractData.classes.map((x, _1, _2) => (x.courseName)).filter((x, _1, _2) => (x !== ""));
	if (classes.length > 0) {
		classesString = "[" + classes.join() + "]; ";
	}
	return "<a href='/contracts/" + entry.contractId + "'>"
			+ entry.contractData.semester + " " + entry.contractData.contractYear + "; "
			// + classes.join()
			+ classesString
			// + entry.contractData.classes.forEach((y, _, _) => (y.courseName))
			// + "; "
			// + $.each(entry.contractData.classes, (_, x) => (x.courseName))
			+ "last modified " + timeSince(new Date(entry.dateLastModified)) + " ago </a>";
}

function createContract() {
	$.post("/contracts", function(data) {
		console.log(data);
		var url = "/contracts/" + data.contractId;
		window.location = url;
	})
}

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
