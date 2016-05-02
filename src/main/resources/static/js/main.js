var googleUser = {};
var gIdToken = {};
var onSignInExtra = function() {}

function hideLogout() {
	$(".logged-in").hide();
}

function newContract() {
    $(".blank-form").show();
}

function signOut() {
	console.log('Signing out ' + googleUser.getBasicProfile().getName());
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.disconnect();
	auth2.signOut().then(function() {
		console.log('User signed out.');
	});
	Cookies.remove("id_token3");
	$(".logged-in").hide();
	$(".logged-out").show();
}

function onSignIn(success) {
	console.log(JSON.stringify({message: "success", value: success}));
	googleUser = success;
	Cookies.set('id_token3', googleUser.getAuthResponse().id_token, {expires: 7});
	
	// Useful data for your client-side scripts:
	var profile = googleUser.getBasicProfile();
	
        
	$(".logged-in").show();
	$(".logged-out").hide();

	$(".user-full-name").html(profile.getName());

	// The ID token you need to pass to your backend:
	var id_token = googleUser.getAuthResponse().id_token;
	$("#google_id_token").val(id_token);
	gIdToken = id_token;
	
	$("#firstName").val(profile.getGivenName());
	$("#lastName").val(profile.getFamilyName());
	onSignInExtra();
};

function onSignInFailure(error) {
	var errorString = "Sorry, something went wrong with the Google sign-in; please let us know about the issue";
	console.log(JSON.stringify({message: "fail", value: error}));
}