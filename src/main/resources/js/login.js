//Copyright 2016 Jackie Scholl
const React = require('react');
const ReactDOM = require('react-dom');

const LoginBar = React.createClass({
  /*speak: function() {
    console.log('login bar speaking');
  },*/
  /*getInitialState: function() {
    return {loginListener: null};
  },
  registerListener: function(loginListener) {
    this.setState({loginListener: loginListener});
  },
  getLoginListener: function() {
    return this.state.loginListener;
  },*/
  render: function() {
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <LoginLoadThing onUpdate={this.props.onUpdate} />
          </div>
        </div>
      </nav>
    );
  }
});

const LoginLoadThing = React.createClass({
  getInitialState: function() {
    console.log('initializing LoginLoadThing; gapi defined? '+(typeof gapi != 'undefined'));
    //console.log(typeof yourvar != 'undefined');
    return {scriptHasLoaded: false};
  },
  componentDidMount: function() {
    $(document).on("googleLogin2", ((e) => {
      console.log('captured google login script load; gapi defined? '+(typeof gapi != 'undefined'));
      //console.log(gapi || 'empty');
      this.setState({scriptHasLoaded: true});
    }).bind(this));
  },
  render: function() {
    if (this.state.scriptHasLoaded) {
      return (
        <GoogleLoginArea onUpdate={this.props.onUpdate} />
      );
    } else {
      return (
        <div />
      )
    }
  }
});


const getLoginState = function(googleUser) {
  if (!googleUser) {
    console.log('returning empty state');
    return {loggedIn: false, googleUser: null, gIdToken: null, logins: {},
        personalInfo: {}};
  } else {
    console.log('returning full google state');
    const gIdToken = googleUser.getAuthResponse().id_token;
    const logins = {'accounts.google.com': gIdToken};
    const profile = googleUser.getBasicProfile();
    return {
        loggedIn: true,
        googleUser: googleUser,
        gIdToken: gIdToken,
        logins: {'accounts.google.com': gIdToken},
        personalInfo: {
          fullName: profile.getName(),
          firstName: profile.getGivenName(),
          lastName: profile.getFamilyName()
        }
      };
  }
};

const GoogleLoginArea = React.createClass({
  updateLogin: function(googleUser) {
    const stateResult = getLoginState(googleUser);
    this.setState(stateResult);
    this.sendLoginUpdate(stateResult);
  },
  sendLoginUpdate: function(state) {
    //$(document).trigger("login-update", stateResult);
    this.props.onUpdate(state);
  },
  getInitialState: function() {
    const loginState = getLoginState(null);
    //this.sendLoginUpdate(loginState);
    return loginState;
  },
  signOut: function() {
    console.log('Signing out ' + this.state.googleUser.getBasicProfile().getName());
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.disconnect();
    auth2.signOut().then(function() {
      console.log('User signed out.');
    });
    this.updateLogin(null);
  },
  onSignIn: function(googleUser) {
    console.log(JSON.stringify({message: "success1", value: googleUser}));
    this.updateLogin(googleUser);
  },
  onSignInFailure: function(error) {
    console.log("oops");
    const errorString = "Sorry, something went wrong with the Google sign-in; please let us know about the issue";
    console.log(JSON.stringify({message: "fail", value: error}));
  },
  renderLoginButton: function() {
    console.log('rendering login button');
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 220,
      'height': 30,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': this.onSignIn,
      'onfailure': this.onSignInFailure
    });
  },
  componentDidMount: function() {
    this.renderLoginButton();
  },
  render: function() {
    const fullName = this.state.personalInfo.fullName || 'ANON';
    if (this.state.loggedIn) {
      return (
        <div id="login-area" className="login-area navbar-brand">
          <span>
            Welcome {fullName}!
            <a href="#" onclick={this.signOut} id="logout-link">Sign out</a>
          </span>
        </div>
      );
    } else {
      return (
        <div id="login-area" className="login-area navbar-brand">
          <div id="my-signin2"></div>
        </div>
      );
    }
  }
});

const LoginHandler = function() {
  this.listeners = [];
  this.value = getLoginState(null);
  this.addListener((x) => {this.value = x;}); // callback that updates the value
  return this;
};

LoginHandler.prototype.trigger = function(state) {
  this.listeners.forEach((callback) => {callback(state);});
};

LoginHandler.prototype.addListener = function(callback) {
  this.listeners.push(callback);
};



const renderLoginBar = function() {
  const loginHandler = new LoginHandler();
  const onUpdateListener = loginHandler.trigger.bind(loginHandler);

  const element = ReactDOM.render(
    <LoginBar onUpdate={onUpdateListener} />,
    document.getElementById('login-bar')
  );

  return loginHandler;
}

module.exports = {
  render: renderLoginBar
}

/*








  console.log('LoginHandler trigger called; this=');
  console.log(this);

  //console.log('LoginHandler addListener called');
/*const loginBar = ReactDOM.render(
  <LoginBar />,
  document.getElementById('login-bar')
);*/
//this.setState(this.getStateResult(googleUser));
//gIdToken = googleUser.getAuthResponse().id_token;
//Cookies.set('id_token3', googleUser.getAuthResponse().id_token, {expires: 7});
//Cookies.set('id_token3', gIdToken, {expires: 7});

// Useful data for your client-side scripts:
//var profile = googleUser.getBasicProfile();

//$(".logged-in").show();
//$(".logged-out").hide();

//$(".user-full-name").html(profile.getName());

// The ID token you need to pass to your backend:
//$("#google_id_token").val(gIdToken);
//gIdToken = id_token;

//$("#firstName").val(profile.getGivenName());
//$("#lastName").val(profile.getFamilyName());

//$(document).trigger("googleLogin");
//console.log('login event triggered');

/*Cookies.remove("id_token2");
Cookies.remove("test_cookie");
Cookies.remove("SQLiteManager_currentLangue");
Cookies.remove("G_AUTHUSER_H");*/
/*return (
  <div id="login-area" className="login-area navbar-brand">
    <div id="login" className="logged-out">
      <div className="g-signin2" id="my-signin" data-onsuccess="onSignIn" data-onfailure="onSignInFailure"
          data-width="240" data-longtitle="true" data-theme="dark">
      </div>
      <div id="my-signin2"></div>
    </div>
    <div id="logout" className="logged-in" style={{display: 'none'}}>
      <span>
        Welcome {fullName}!
        <a href="#" onclick="signOut();" id="logout-link">Sign out</a>
      </span>
    </div>
  </div>
);*/
//this.setState(this.getStateResult(null));
//Cookies.remove("id_token3");
//googleUser = null;
//gIdToken = null;
//this.setState({loggedIn: false, googleUser: null, gIdToken: null});
//$(".logged-in").hide();
//$(".logged-out").show();
/*console.log("bar: ");
console.log(bar);
console.log("speak!");
bar.speak();
console.log("done");*/


/*var googleUser = null;
gIdToken = null;

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

  $(document).trigger("googleLogin");
  //console.log('login event triggered');

  /*Cookies.remove("id_token2");
  Cookies.remove("test_cookie");
  Cookies.remove("SQLiteManager_currentLangue");
  Cookies.remove("G_AUTHUSER_H");
};

function onSignInFailure(error) {
  console.log("oops");
  var errorString = "Sorry, something went wrong with the Google sign-in; please let us know about the issue";
  console.log(JSON.stringify({message: "fail", value: error}));
}
*/

  /*getStateResult: function(googleUser) {
    if (!googleUser) {
      console.log('returning empty state');
      return {loggedIn: false, googleUser: null, gIdToken: null, logins: {},
          personalInfo: {}};
    } else {
      console.log('returning full google state');
      const gIdToken = googleUser.getAuthResponse().id_token;
      const logins = {'accounts.google.com': gIdToken};
      const profile = googleUser.getBasicProfile();
      return {
          loggedIn: true,
          googleUser: googleUser,
          gIdToken: gIdToken,
          logins: {'accounts.google.com': gIdToken},
          personalInfo: {
            fullName: profile.getName(),
            firstName: profile.getGivenName(),
            lastName: profile.getFamilyName()
          }
        };
    }
  },*/
  /*this.addListener((x) => {
    console.log('test listener recieved event: ');
    console.log(x);
    console.log('current value: ');
    console.log(this.value);
  }); // test listener*/


  /*LoginHandler.prototype.sayX = function() {
    console.log('Hello, x= ' + this.x);
  };*/

    /*var loginHandler = {
      listeners: [],
      trigger: (function(x) {
        console.log(this);
        this.listeners.forEach((e) => {e(x);});
      }),
      addListener: function(listener) {
        this.listeners.push(listener);
      },
      value: getLoginState(null)
    };
    loginHandler.addListener((x) => {console.log('test listener recieved event: '); console.log(x);});
    loginHandler.addListener((x) => {loginHandler.value = x;});*/
