onSignInExtra = function() {
	$("#content").html("hello!");
	$.getJSON("/api/contracts",
		{id_token: googleUser.getAuthResponse().id_token},
		function(data) {
			console.log(data);
			alert("First contract id: " + data.contracts[0].contractId);
		}
	);
}