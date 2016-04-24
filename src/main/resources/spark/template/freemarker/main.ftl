<!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- In real-world webapps, css is usually minified and
         concatenated. Here, separate normalize from our code, and
         avoid minification for clarity. -->
    <link rel="stylesheet" href="/css/normalize.css">
    <link rel="stylesheet" href="/css/html5bp.css">
    <link rel="stylesheet" href="/css/main.css">
    <link href='http://fonts.googleapis.com/css?family=Oleo+Script'
          rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Lobster+Two'
          rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Just+Another+Hand'
          rel='stylesheet' type='text/css'>
    <!-- Again, we're serving up the unminified source for clarity. -->
    <script src='/js/main.js'></script>
    <script src="/js/jquery-2.1.1.js"></script>
    
    <meta name="google-signin-scope" content="profile email">
    <meta name="google-signin-client_id" content="784978983695-km7e0k6q09qmrmgk3r2aortu0oqdk2tk.apps.googleusercontent.com">
    <meta name="google-signin-hosted_domain" content="ncf.edu">
    <script src="https://apis.google.com/js/platform.js" async defer></script>
  </head>
  <body>
  	<div id="login-area" align="left">
		<div id="login" class="logged-out"><div class="g-signin2" id="my-signin" data-onsuccess="onSignIn" data-onfailure="onSignInFailure"
				 data-width="240" data-longtitle="true" data-theme="dark"></div></div>
		<div id="logout" class="logged-in" style="display:none">
			<p>Welcome <span class="user-full-name">ANON</span>!</p>
			<a href="#" onclick="signOut();" id="logout-link">Sign out</a>
		</div>
	</div>

    ${heading}

  	<div id="options-area" align="center">
		<div id="new-contract" class="new-contract" style="display:none">
			<a href="#" onclick="newContract();" id="new-contract-link">New Contract</a>
		</div>

		<div id="old-contract" class="old-contract" style="display:none">
			<a href="#" onclick="oldContract();" id="old-contract-link">Use an old Contract</a>
		</div>

		<form id="unsaved-contract" class="unsaved-contract">
                        <a href="/contract.pdf" >Use a blank contract</a>
		        </br>
                        <a href="/contract renegotiation.pdf" >Use a blank renegotiation contract</a>
		</form>
	</div>
	
    ${content}
    
  </body>
</html>
