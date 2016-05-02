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
	private static ContractStore contractStore = null;

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

		//contractStore = JsonDatabaseManager.instance();
		contractStore = DynamoDBContractStore.INSTANCE;
		
		Spark.get("/contract", "text/html", new WelcomePageStarter(), freeMarker);
		Spark.post("/contract/saved", "application/pdf", new SavedContractHandler());
		Spark.post("/contract/unsaved", "application/pdf", new UnsavedContractHandler());
		Spark.get("/contracts", "text/html",  new ContractList(), freeMarker);
		Spark.post("/contracts", new AddContract());
		Spark.get("/contracts/:contractId", "text/html", new ContractForm(), freeMarker);
		//Spark.get("/contracts/:contractId", "application/pdf", new PDFContractHandler());
		Spark.get("/contracts/:contractId/pdf", new PDFContractHandler());
		Spark.post("/contracts/:contractId/save", "text/html", new SaveContractHandler());
		Spark.get("/api/contracts", "text/json", new ApiContractList());

		// Spark.post("/results", new ResultsHandler(), freeMarker);
	}

        
         /**
	 * returns the blank form.
	 */
	private static class UnsavedContractHandler implements Route {
		public Object handle(Request req, Response res) {

			ContractData contractData = new ContractData();

			res.raw().setContentType("application/pdf");
			try {
				PDFCreator.buildPDF(res.raw().getOutputStream(), contractData);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}

			return null;
		}
	}
        
        
	/**
	 * Serves as the first load of the game. This is called using GET while the PlayHandler is called using POST (since
	 * it's a form submission)
	 */
	private static class WelcomePageStarter implements TemplateViewRoute {

		@Override
		public ModelAndView handle(Request req, Response res) {
			Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
					.put("title", "Contract Form").build();
			return new ModelAndView(variables, "contract.ftl");
		}
	}

	private static class ContractForm implements TemplateViewRoute {
		@Override
		public ModelAndView handle(Request req, Response res) {
			String contractId = req.params(":contractId");
			ContractEntry contractEntry = contractStore.getContractByContractId(contractId);
			if (!getGoogleIdFromCookie(req).equals(contractEntry.googleId)) {
				throw new IllegalArgumentException(
						"You are not the owner of this contract. Please go back to the contracts page");
			}

			System.out.println(contractEntry.toJson());
			// use details from contractEntry to pre-fill the contract form
			Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
					.put("title", "Contract Form")
					.put("id", contractId)
					.build();
			return new ModelAndView(variables, "contract2.ftl");
		}
	}

	/**
	 * Shows the various contracts the user has
	 */
	private static class ContractList implements TemplateViewRoute {
            @Override
            public ModelAndView handle(Request req, Response res) {
                Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
                    .put("title", "Contract List")
                    .build();
                return new ModelAndView(variables, "contractList.ftl");
            }
	}

	private static class AddContract implements Route {
		public Object handle(Request req, Response res) {
			String googleId = getGoogleIdFromCookie(req);
			String contractId = contractStore.createContract(googleId);

			Map<String, Object> resultObj = new HashMap<>();
			resultObj.put("contractId", contractId);
			String result = new Gson().toJson(resultObj);

			//System.out.println(result);

			res.status(201); // Created
			res.header("Location", "/contracts/" + contractId);

			res.raw().setContentType("text/json");
			try {
				res.raw().getOutputStream().print(result);
				res.raw().getOutputStream().close();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}

			return null;
		}
	}

	/**
	 * Returns the generated PDF.
	 */
	private static class ApiContractList implements Route {
		public Object handle(Request req, Response res) {
			QueryParamsMap qm = req.queryMap();
			System.out.println(qm.toMap());

			//Optional<String> googleId = getGoogleID(qm.value("id_token"));
			Optional<String> googleId = Optional.of(getGoogleIdFromCookie(req));
			
			List<ContractEntry> contractEntries = contractStore.getContractsByGoogleId(googleId.get());

			Map<String, Object> resultObj = new HashMap<>();
			resultObj.put("contracts", contractEntries);

			String result = new Gson().toJson(resultObj);

			System.out.println(result);

			res.raw().setContentType("text/json");
			try {
				res.raw().getOutputStream().print(result);
				res.raw().getOutputStream().close();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}

			return null;
		}
	}
	
	private static class PDFContractHandler implements Route {
		public Object handle(Request req, Response res) {
			String contractId = req.params(":contractId");
			ContractEntry contractEntry = contractStore.getContractByContractId(contractId);
			if (!getGoogleIdFromCookie(req).equals(contractEntry.googleId)) {
				throw new IllegalArgumentException(
						"You are not the owner of this contract. Please go back to the contracts page");
			}
			//QueryParamsMap qm = req.queryMap();
			//System.out.println("QueryParamsMap: "+ qm.toMap());

			res.raw().setContentType("application/pdf");
			try {
				PDFCreator.buildPDF(res.raw().getOutputStream(), contractEntry.contractData);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}

			return null;
		}
	}
	
	private static class SaveContractHandler implements Route {
		public Object handle(Request req, Response res) {
			QueryParamsMap qm = req.queryMap();

			String googleId = getGoogleIdFromCookie(req);
			String contractId = req.params(":contractId");
			
			/*ContractEntry contractEntry = contractStore.getContractByContractId(contractId);
			System.out.println(contractEntry);
			if (!getGoogleIdFromCookie(req).equals(contractEntry.googleId)) {
				throw new IllegalArgumentException(
						"You are not the owner of this contract. Please go back to the contracts page");
			}*/

			ContractData contractData = getContractDataFromParams(qm, googleId);
			//System.out.println("Contract Data from params: "+contractData);
			contractStore.updateContract(contractId, googleId, contractData);
			System.out.println("Contract Saved");
			//contractStore.showContracts();
			
			res.redirect("/contracts/"+contractId+"/pdf");
			
			res.status(204);

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

			//System.out.println(googleId);

			ContractData contractData = getContractDataFromParams(qm,
					googleId.get());
			googleId.ifPresent(id -> contractStore.updateContract(contractStore.createContract(id), id, contractData));
			contractStore.showContracts();

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
		for (int i = 0; i < classData.length; i++) {
			classData[i] = getClassDataFromParams(qm, i);
		}
		data.classes = classData;
		return data;
	}

	private static ClassData getClassDataFromParams(QueryParamsMap qm, int index) {
		return new ClassData(qm.value("Course number" + index), qm.value("Course name" + index),
				(qm.value("internship" + index) != null), qm.value("session" + index), qm.value("Instructor" + index));
	}
	
	private static String getGoogleIdFromCookie(Request req) {
		//System.out.println("id_token2: " + req.cookie("id_token2"));
		Optional<String> googleId = Optional.ofNullable(req.cookie("id_token3")).flatMap(Main::getGoogleID);
		if (!googleId.isPresent()) {
			throw new IllegalArgumentException(
					"Google log-in cookie missing or invalid. Please go to /contracts and sign in");
		}
		return googleId.get();
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
			System.out.println(idToken);
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
			//System.out.println("verified token: " + idToken);
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
			e.printStackTrace();
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
