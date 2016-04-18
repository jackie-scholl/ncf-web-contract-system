var googleUser = {};

function hideLogout() {
	$("#logout").hide();
}

function signOut() {
	console.log('Signing out ' + googleUser2.getBasicProfile().getName());
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.disconnect();
	auth2.signOut().then(function() {
		console.log('User signed out.');
	});
	$("#login").show();
	$("#logout").hide();
}

function onSignIn(success) {
	console.log(JSON.stringify({message: "success", value: success}));
	googleUser = success;
	// Useful data for your client-side scripts:
	var profile = googleUser.getBasicProfile();
	
	$("#login").hide();
	$("#logout").show();
	$(".user-full-name").html(profile.getName());

	// The ID token you need to pass to your backend:
	var id_token = googleUser.getAuthResponse().id_token;
	$("#google_id_token").val(id_token);
};

function onSignInFailure(error) {
	var errorString = "Sorry, something went wrong with the Google sign-in; please let us know about the issue";
	console.log(JSON.stringify({message: "fail", value: error}));
}
