package edu.ncf.contractform;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Optional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import spark.Request;

public class GooglePayload {
	private static final String appId = "784978983695-km7e0k6q09qmrmgk3r2aortu0oqdk2tk.apps.googleusercontent.com";
	private static final GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
			new GsonFactory())
					.setAudience(Arrays.asList(appId))
					.setIssuer("accounts.google.com")
					.build();
	private static final String hostedDomain = "ncf.edu";
	private static final String idTokenCookieName = "id_token3";
	private final Payload payload;

	private GooglePayload(Payload payload) {
		this.payload = payload;
	}

	public String googleId() {
		// printDebug();
		return payload.getSubject();
	}

	public Payload payload() {
		return payload;
	}

	public String firstName() {
		return (String) payload.get("given_name");
	}

	public String lastName() {
		return (String) payload.get("family_name");
	}

	public void printDebug() {
		// System.out.println(payload.get("given_name"));
		System.out.println(payload.keySet());
	}

	public static GooglePayload fromRequest(Request req) {
		return fromIdTokenString(
				getCookieFromRequest(req, idTokenCookieName)
						.orElseThrow(() -> VerificationException.COOKIE_MISSING));
	}

	private static Optional<String> getCookieFromRequest(Request req, String cookieName) {
		return Optional.ofNullable(req.cookie(cookieName)).filter(s -> !s.equals(""));
	}

	public static GooglePayload fromIdTokenString(String idTokenString) {
		try {
			return fromGoogleIdToken(Optional.ofNullable(verifier.verify(idTokenString))
					.orElseThrow(() -> new VerificationException("invalid token")));
		} catch (GeneralSecurityException | IOException e) {
			e.printStackTrace();
			throw new VerificationException("There was an issue verifying the provided Google ID token string");
		}
	}

	private static GooglePayload fromGoogleIdToken(GoogleIdToken idToken) {
		return fromPayload(Optional.ofNullable(idToken.getPayload())
				.orElseThrow(() -> new VerificationException("Payload empty")));
	}

	private static GooglePayload fromPayload(Payload payload) {
		if (payload.getHostedDomain().equals(hostedDomain)) {
			return new GooglePayload(payload);
		} else {
			throw new VerificationException("Google ID is from bad domain; should have domain " + hostedDomain
					+ ", but actual domain was " + payload.getHostedDomain());
		}
	}

	/*private static String getGoogleIdFromPayload(Payload payload) {
		System.out.println(payload.entrySet());
		return payload.getSubject();
	}
	
	private static Payload getVerifiedPayloadFromCookie(Request req) {
		Optional<Payload> optionalPayload = getOptionalVerifiedPayloadFromCookie(req);
		if (optionalPayload.isPresent()) {
			return optionalPayload.get();
		} else {
			throw new RuntimeException("Payload invalid or not present; please reload page.");
		}
	}
	
	private static Optional<Payload> getOptionalVerifiedPayloadFromCookie(Request req) {
		return Optional.ofNullable(req.cookie("id_token3"))
				.flatMap(Main::verify)
				.filter(p -> p.getHostedDomain().equals("ncf.edu"));
	}
	
	private static String getGoogleIdFromCookie(Request req) {
		// System.out.println("id_token3: " + req.cookie("id_token3"));
		Optional<String> googleId = Optional.ofNullable(req.cookie("id_token3")).flatMap(Main::getGoogleID);
		if (!googleId.isPresent()) {
			throw new IllegalArgumentException(
					"Google log-in cookie missing or invalid. Please go to /contracts and sign in");
		}
		return googleId.get();
	}
	
	private static Optional<String> getGoogleID(String idToken) {
		// System.out.println("in getGoogleID; idToken: " + idToken);
		Optional<Payload> optionalPayload = idToken.equals("ANON") ? Optional.empty() : verify(idToken);
		// System.out.println("in getGoogleID; optionalPayload: " + optionalPayload);
		// System.out.println(System.currentTimeMillis());
		if (optionalPayload.isPresent()) {
			Payload payload = optionalPayload.get();
			if (!payload.getHostedDomain().equals("ncf.edu")) {
				throw new RuntimeException("User signed in with non-NCF google account");
			}
			// System.out.println("in getGoogleID; payload: " + payload);
			return Optional.of(payload.getSubject());
		} else {
			// System.out.println(idToken);
			System.out.println("Payload not present; idToken: " + idToken);
			return Optional.empty();
		}
	}
	
	private static Optional<Payload> verify(String idTokenString) {
		NetHttpTransport transport = new NetHttpTransport();
		JsonFactory jsonFactory = new GsonFactory();
		GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
				.setAudience(Arrays.asList("784978983695-km7e0k6q09qmrmgk3r2aortu0oqdk2tk.apps.googleusercontent.com"))
				.setIssuer("accounts.google.com")
				.build();
		try {
			// System.out.println("in verify; idTokenString: " + idTokenString);
			// System.out.println("About to verify: " +System.currentTimeMillis());
			GoogleIdToken idToken = verifier.verify(idTokenString);
			// System.out.println(System.currentTimeMillis());
			// System.out.println("in verify; verified token: " + idToken);
			return Optional.ofNullable(idToken).map(x -> x.getPayload());
		} catch (GeneralSecurityException | IOException e) {
			e.printStackTrace();
			return Optional.empty();
		}
	}*/

	static class VerificationException extends RuntimeException {
		public static final VerificationException COOKIE_MISSING = new VerificationException(
				"Google ID token cookie with name of " + idTokenCookieName + " was missing");

		public VerificationException(String reason) {
			super("Google ID token failed verification; reason: " + reason);
		}
	}

	/*static enum VerificationExceptionSpecific implements VerificationException {
		COOKIE_MISSING ("Google ID token cookie with name of " + idTokenCookieName + " was missing");
		
		private VerificationExceptionSpecific(String reason) {
			super(reason);
		}
	}*/
}
