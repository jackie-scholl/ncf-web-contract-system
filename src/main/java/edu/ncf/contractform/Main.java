package edu.ncf.contractform;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.GeneralSecurityException;
import java.util.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

import freemarker.template.Configuration;
import spark.*;
import spark.template.freemarker.FreeMarkerEngine;

public class Main {

	/**
	 * The below if/else if statements don't actually do anything. Since we aren't running from command line, nothing
	 * changes in the options parser. The only part that's needed is runSparkServer();
	 *
	 * @param args
	 */
	public static void main(String[] args) {
		OptionParser parser = new OptionParser();

		parser.accepts("generate");

		OptionSpec<String> solveSpec = parser.accepts("solve").withRequiredArg().ofType(String.class);

		OptionSet options = parser.parse(args);

		runSparkServer();
	}

	/**
	 * Sets the port, loads the static files for javascript/css, and sets up the server so that you have a play url and
	 * a results url.
	 */
	private static void runSparkServer() {
		Spark.setPort(4230);

		// We need to serve some simple static files containing CSS and JavaScript.
		// This tells Spark where to look for urls of the form "/static/*".
		Spark.externalStaticFileLocation("src/main/resources/static");

		// Development is easier if we show exceptions in the browser.
		Spark.exception(Exception.class, new ExceptionPrinter());

		// We render our responses with the FreeMaker template system.
		FreeMarkerEngine freeMarker = createEngine();

		try {
			JsonDatabaseManager.createTables();
		} catch (Exception e) {
			e.printStackTrace();
		}

		Spark.get("/contract", new WelcomePageStarter(), freeMarker);
		Spark.post("/contract/saved", new SavedContractHandler());
		Spark.get("/contractList", new ContractList(), freeMarker);
		Spark.get("/api/getContracts", new ApiContractList());
		// Spark.post("/results", new ResultsHandler(), freeMarker);
	}

	/**
	 * Serves as the first load of the game. This is called using GET while the PlayHandler is called using POST (since
	 * it's a form submission)
	 */
	private static class WelcomePageStarter implements TemplateViewRoute {

		@Override
		public ModelAndView handle(Request rqst, Response rspns) {
			// Set<String> usernamesTaken = DatabaseManager.getUsernames();
			Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
					.put("title", "Contract Form").build();
			return new ModelAndView(variables, "contract.ftl");
		}
	}
	
	/**
	 * Shows the various contracts the user has
	 */
	private static class ContractList implements TemplateViewRoute {
		@Override
		public ModelAndView handle(Request rqst, Response rspns) {
			Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
					.put("title", "Contract List").build();
			return new ModelAndView(variables, "contractList.ftl");
		}
	}
	
	/**
	 * Returns the generated PDF.
	 */
	private static class ApiContractList implements Route {
		public Object handle(Request req, Response res) {
		    QueryParamsMap qm = req.queryMap();
			System.out.println(qm.toMap());
			
			Optional<String> googleId = getGoogleID(qm.value("id_token"));
			
			List<Long> contractList = JsonDatabaseManager.getUserContracts(googleId.get());
			
			Map<String, Object> resultObj = new HashMap<>();
			resultObj.put("id_token", googleId.get());
			resultObj.put("contractIds", contractList);
			
			//String result = new Gson().toJson(contractList);
			String result = new Gson().toJson(resultObj);
			
			System.out.println(result);
			
			res.raw().setContentType("text/json");
			try {
				res.raw().getOutputStream().print(result);
				
				res.raw().getOutputStream().close();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
			
			/*ContractData contractData = getContractDataFromParams(qm,
                                googleId.get());
			googleId.ifPresent(id -> JsonDatabaseManager.saveNewContract(id, contractData));
			JsonDatabaseManager.selectContracts();
			
			res.raw().setContentType("application/pdf");
			try {
				PDFCreator.buildPDF(res.raw().getOutputStream(), contractData);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}*/
		    
		    return null;
		}
	}
	
	/**
	 * Returns the generated PDF.
	 */
	private static class SavedContractHandler implements Route {
		public Object handle(Request req, Response res) {
		    QueryParamsMap qm = req.queryMap();
			System.out.println(qm.toMap());
			
			Optional<String> googleId = getGoogleID(qm.value("id_token"));
			
			System.out.println(googleId);
			
			ContractData contractData = getContractDataFromParams(qm,
                                googleId.get());
			googleId.ifPresent(id -> JsonDatabaseManager.saveNewContract(id, contractData));
			JsonDatabaseManager.selectContracts();
			
			res.raw().setContentType("application/pdf");
			try {
				PDFCreator.buildPDF(res.raw().getOutputStream(), contractData);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		    
		    return null;
		}
	}

	private static ContractData getContractDataFromParams(QueryParamsMap qm,
                String googleId) {
		ContractData data = new ContractData();
		data.contractYear = qm.value("year");
		if (ContractData.LEGAL_SEMESTERS.contains(qm.value("Semester"))) {
                    data.semester = qm.value("Semester");
		} else {
			throw new IllegalArgumentException(
                                "Semester must be one of the following: " + 
                                        ContractData.LEGAL_SEMESTERS);
		}
		data.lastName = qm.value("lastName");
		data.firstName = qm.value("firstName");
		data.nNumber = qm.value("n_number");
		data.expectedGradYear = qm.value("expected_grad_year");
		data.studyLocation = qm.value("location");
		data.boxNumber = qm.value("box number");
		data.goals = qm.value("goals");
		data.certificationCriteria = qm.value("cert");
		data.descriptionsOtherActivities = qm.value("other");
		data.advisorName = qm.value("advisor name");
		ClassData[] classData = new ClassData[8];
		for (int i=0; i<classData.length; i++) {
			classData[i] = getClassDataFromParams(qm, i);
		}
		data.classes = classData;
		return data;
	}
	
	private static ClassData getClassDataFromParams(QueryParamsMap qm, int index) {
		return new ClassData(qm.value("Course number"+index), qm.value("Course name"+index),
				(qm.value("internship"+index) != null), qm.value("session"+index), qm.value("Instructor"+index));
	}

	private static Optional<String> getGoogleID(String idToken) {
		Optional<Payload> optionalPayload = idToken.equals("ANON") ? Optional.empty() : verify(idToken);
		if (optionalPayload.isPresent()) {
			Payload payload = optionalPayload.get();
			if (!payload.getHostedDomain().equals("ncf.edu")) {
				throw new RuntimeException("User signed in with non-NCF google account");
			}
			return Optional.of(payload.getSubject());
		} else {
			System.out.println("Payload not present");
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
			GoogleIdToken idToken = verifier.verify(idTokenString);
			// System.out.println(idToken);
			return Optional.ofNullable(idToken).map(x -> x.getPayload());
		} catch (GeneralSecurityException | IOException e) {
			e.printStackTrace();
			return Optional.empty();
		}
	}

	// You need not worry about understanding what's below here.
	private static FreeMarkerEngine createEngine() {
		Configuration config = new Configuration();
		File templates = new File("src/main/resources/spark/template/freemarker");
		try {
			config.setDirectoryForTemplateLoading(templates);
		} catch (IOException ioe) {
			System.out.printf("ERROR: Unable use %s for template loading.\n",
					templates);
			System.exit(1);
		}
		return new FreeMarkerEngine(config);
	}

	private static final int INTERNAL_SERVER_ERROR = 500;

	private static class ExceptionPrinter implements ExceptionHandler {

		@Override
		public void handle(Exception e, Request req, Response res) {
			res.status(INTERNAL_SERVER_ERROR);
			StringWriter stacktrace = new StringWriter();
			try (PrintWriter pw = new PrintWriter(stacktrace)) {
				pw.println("<pre>");
				e.printStackTrace(pw);
				pw.println("</pre>");
			}
			res.body(stacktrace.toString());
		}
	}

}
