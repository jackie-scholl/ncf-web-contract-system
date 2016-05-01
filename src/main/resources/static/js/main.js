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
        
	$(".logged-in").hide();
	$(".logged-out").show();
}

function onSignIn(success) {
	console.log(JSON.stringify({message: "success", value: success}));
	googleUser = success;
	console.log("id token2 before: " + getCookie("id_token2"));
	//document.cookie = "id_token="+googleUser.getAuthResponse().id_token;
	//deleteCookie("id_token2");
	setCookie("id_token2", googleUser.getAuthResponse().id_token, 1);
	console.log("id token2 after: " + getCookie("id_token2"));
	console.log("all cookies after: " + document.cookie);
	
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

function deleteCookie(cname) {
	document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    var path = "path=/contracts/";
    document.cookie = cname + "=" + cvalue + "; " + expires;// + "; " + path;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}
