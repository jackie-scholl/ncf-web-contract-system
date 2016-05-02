onSignInExtra = function() {
	$("#content").html("hello!");
	$.getJSON("/api/contracts", {
		id_token : googleUser.getAuthResponse().id_token
	}, function(data) {
		console.log(data);
		$("#content").append(data.contracts[0].contractId);
		var items = [];
		$.each(data.contracts, function(_, entry) {
			items.push("<li id='" + entry.contractId + "'>" + link(entry)
					+ "</li>");
		});

		$("<ul/>", {
			"class" : "my-new-list",
			html : items.join("")
		}).appendTo("#content");
	});
}

if (googleUser != null) {
	onSignInExtra();
}

function link(entry) {
	return "<a href='/contracts/" + entry.contractId + "'>"
			+ timeSince(new Date(entry.dateLastModified)) + " ago </a>";
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