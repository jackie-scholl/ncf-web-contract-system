//Copyright 2016 Jackie Scholl
'use strict';
/*global $ gapi*/
const React = require('react');
const ReactDOM = require('react-dom');

const LoginBar = React.createClass({
  render: function() {
    return (
      <nav className='navbar navbar-inverse navbar-fixed-top'>
        <div className='container-fluid'>
          <div className='navbar-header'>
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
    return {scriptHasLoaded: false};
  },
  componentDidMount: function() {
    $(document).on('googleLogin2', () => {
      console.log('captured google login script load; gapi defined? '+(typeof gapi != 'undefined'));
      this.setState({scriptHasLoaded: true});
    });
  },
  render: function() {
    if (this.state.scriptHasLoaded) {
      return (
        <GoogleLoginArea onUpdate={this.props.onUpdate} />
      );
    } else {
      return (
        <div />
      );
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
    this.props.onUpdate(stateResult);
  },
  getInitialState: function() {
    return getLoginState(null);
  },
  signOut: function() {
    console.log('Signing out ' + this.state.googleUser.getBasicProfile().getName());
    const auth2 = gapi.auth2.getAuthInstance();
    //auth2.disconnect();
    auth2.signOut().then(function() {
      console.log('User signed out.');
      this.updateLogin(null);
      this.renderLoginButton();
    }.bind(this));
  },
  onSignIn: function(googleUser) {
    console.log(JSON.stringify({message: 'success1', value: googleUser}));
    this.updateLogin(googleUser);
  },
  onSignInFailure: function(error) {
    console.log('oops');
    const errorString = 'Sorry, something went wrong with the Google sign-in; please let us know about the issue';
    console.log(JSON.stringify({message: errorString, value: error}));
  },
  renderLoginButton: function() {
    console.assert(!!$('#my-signin2').length);
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
        <div id='login-area' className='login-area navbar-brand'>
          <span>
            Welcome {fullName}!
            <a href='#' onClick={this.signOut} id='logout-link'>Sign out</a>
          </span>
        </div>
      );
    } else {
      return (
        <div id='login-area' className='login-area navbar-brand'>
          <div id='my-signin2'></div>
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

  ReactDOM.render(
    <LoginBar onUpdate={onUpdateListener} />,
    document.getElementById('login-bar')
  );

  return loginHandler;
};

module.exports = {
  render: renderLoginBar
};
