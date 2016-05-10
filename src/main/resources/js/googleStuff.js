//var Cookies = require('js-cookie');

var googleUser = null;
var gIdToken = null;
var onSignInExtra = function() {};

console.log('hey there!');

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
	googleUser = null;
	gIdToken = null;
	$(".logged-in").hide();
	$(".logged-out").show();
}

function onSignIn(success) {
	console.log(JSON.stringify({message: "success", value: success}));
	googleUser = success;
	gIdToken = googleUser.getAuthResponse().id_token;
	//Cookies.set('id_token3', googleUser.getAuthResponse().id_token, {expires: 7});
	Cookies.set('id_token3', gIdToken, {expires: 7});

	// Useful data for your client-side scripts:
	var profile = googleUser.getBasicProfile();

	$(".logged-in").show();
	$(".logged-out").hide();

	$(".user-full-name").html(profile.getName());

	// The ID token you need to pass to your backend:
	$("#google_id_token").val(gIdToken);
	//gIdToken = id_token;

	$("#firstName").val(profile.getGivenName());
	$("#lastName").val(profile.getFamilyName());
	onSignInExtra();

	Cookies.remove("id_token2");
	Cookies.remove("test_cookie");
	Cookies.remove("SQLiteManager_currentLangue");
	Cookies.remove("G_AUTHUSER_H");
};

function onSignInFailure(error) {
	var errorString = "Sorry, something went wrong with the Google sign-in; please let us know about the issue";
	console.log(JSON.stringify({message: "fail", value: error}));
}

/*module.exports = {
	signOut: signOut,
	onSignIn: onSignIn,
	onSignInFailure: onSignInFailure
}*/
