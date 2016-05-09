package edu.ncf.contractform;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import joptsimple.OptionParser;
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

		contractStore = JsonDatabaseManager.instance();
		// contractStore = DynamoDBContractStore.INSTANCE;

		// Spark.get("/contract", "text/html", new WelcomePageStarter(), freeMarker);
		// Spark.post("/contract/saved", "application/pdf", new SavedContractHandler());
		// Spark.post("/contract/unsaved", "application/pdf", new UnsavedContractHandler());
		Spark.get("/contracts", "text/html", new ContractList(), freeMarker);
		Spark.post("/contracts", new AddContract());
		Spark.get("/contracts/:contractId", "text/html", new ContractForm(), freeMarker);
		// Spark.get("/contracts/:contractId", "application/pdf", new PDFContractHandler());
		Spark.get("/contracts/:contractId/pdf", new PDFContractHandler());
		// Spark.post("/contracts/:contractId/save", "text/html", new SaveContractHandler());
		Spark.post("/contracts/:contractId/save2", "text/html", new SaveContractHandler2());
		Spark.get("/api/contracts", "text/json", new ApiContractList());
		Spark.get("/api/contracts/:contractId", "text/json", new LoadContractHandler());

		// Spark.post("/results", new ResultsHandler(), freeMarker);
	}

	/**
	 * returns the blank form.
	 */
	/*private static class UnsavedContractHandler implements Route {
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
	}*/

	/**
	 * Serves as the first load of the game. This is called using GET while the PlayHandler is called using POST (since
	 * it's a form submission)
	 */
	/*private static class WelcomePageStarter implements TemplateViewRoute {

		@Override
		public ModelAndView handle(Request req, Response res) {
			Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
					.put("title", "Contract Form").build();
			return new ModelAndView(variables, "contract.ftl");
		}
	}*/

	private static class ContractForm implements TemplateViewRoute {
		@Override
		public ModelAndView handle(Request req, Response res) {
			String contractId = req.params(":contractId");
			// use details from contractEntry to pre-fill the contract form
			Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
					.put("title", "Contract Form")
					.put("id", contractId)
					.build();
			System.out.println("Done returning blank contract form");
			// return new ModelAndView(variables, "contract2.ftl");
			return new ModelAndView(variables, "contractReact.ftl");
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
			GooglePayload payload = GooglePayload.fromRequest(req);
			String googleId = payload.googleId();
			ContractData initialData = ContractData.getDefault(payload.firstName(), payload.lastName());
			String contractId = contractStore.createContract(googleId, initialData);

			String result = new Gson().toJson(ImmutableMap.of("contractId", contractId));

			// System.out.println(result);

			res.status(201); // Created
			res.header("Location", "/contracts/" + contractId);
			res.type("text/json");
			/*res.raw().setContentType("text/json");
			try {
				res.raw().getOutputStream().print(result);
				res.raw().getOutputStream().close();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}*/

			System.out.println("Add contract done");

			return result;
		}
	}

	/**
	 * Returns the list of contracts
	 */
	private static class ApiContractList implements Route {
		public Object handle(Request req, Response res) {
			long start = System.currentTimeMillis();

			// Optional<String> googleId = getGoogleID(qm.value("id_token"));
			//Optional<String> googleId = Optional.of(getGoogleIdFromCookie(req));
			String googleId = GooglePayload.fromRequest(req).googleId();

			System.out.printf("Time taken so far (got google id): %d ms%n", System.currentTimeMillis() - start);

			List<ContractEntry> contractEntries = contractStore.getContractsByGoogleId(googleId);

			System.out.printf("Time taken so far (got contractEntries): %d ms%n", System.currentTimeMillis() - start);

			String result = new Gson().toJson(ImmutableMap.of("contracts", contractEntries));
			System.out.println(result);

			System.out.printf("Time taken so far (result done): %d ms%n", System.currentTimeMillis() - start);
			
			res.type("text/json");
			/*res.raw().setContentType("text/json");
			try {
				res.raw().getOutputStream().print(result);
				res.raw().getOutputStream().close();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}*/

			System.out.println("Contract list done\n");

			return result;
		}
	}

	private static class PDFContractHandler implements Route {
		public Object handle(Request req, Response res) {
			long start = System.currentTimeMillis();
			String contractId = req.params(":contractId");
			Optional<ContractEntry> contractEntry = contractStore.getContract(contractId, GooglePayload.fromRequest(req).googleId());
			if (!contractEntry.isPresent()) {
				throw new IllegalArgumentException(
						"You are not the owner of this contract, or this contract does not exist. Please go back to the "
								+ "contracts page");
			} else {
				res.raw().setContentType("application/pdf");
				try {
					PDFCreator.buildPDF(res.raw().getOutputStream(), contractEntry.get().contractData);
				} catch (IOException e) {
					throw new RuntimeException(e);
				}
				System.out.println("Time to construct PDF: " + (System.currentTimeMillis() - start) + "\n");
			}

			return null;
		}
	}

	/*private static class SaveContractHandler implements Route {
		public Object handle(Request req, Response res) {
			QueryParamsMap qm = req.queryMap();

			String googleId = GooglePayload.fromRequest(req).googleId();
			String contractId = req.params(":contractId");

			ContractData contractData = getContractDataFromParams(qm, googleId);
			// System.out.println("Contract Data from params: "+contractData);
			contractStore.updateContract(contractId, googleId, contractData);
			System.out.println("Contract Saved");
			// contractStore.showContracts();

			res.redirect("/contracts/" + contractId + "/pdf");

			res.status(204);

			return null;
		}
	}*/

	private static class SaveContractHandler2 implements Route {
		public Object handle(Request req, Response res) {
			System.out.println("Starting to save contract: ");
			String googleId = GooglePayload.fromRequest(req).googleId();
			String contractId = req.params(":contractId");

			String json = req.raw().getParameter("data");
			ContractData contractData = ContractData.fromJson(json);
			System.out.println("Contract Data from json in params: " + contractData);
			contractStore.updateContract(contractId, googleId, contractData);
			System.out.println("Contract Saved (2)\n");
			// contractStore.showContracts();

			res.redirect("/contracts/" + contractId + "/pdf");

			// res.status(204);

			return null;
		}
	}

	private static class LoadContractHandler implements Route {
		public Object handle(Request req, Response res) {
			System.out.println("Starting to load contract: ");
			//Payload p = GooglePayload.fromRequest(req).googleId();
			String googleId = GooglePayload.fromRequest(req).googleId();
			// String googleId = getGoogleIdFromCookie(req);
			String contractId = req.params(":contractId");

			Optional<ContractEntry> entry = contractStore.getContract(contractId, googleId);

			if (entry.isPresent()) {
				String result = new Gson()
						.toJson(ImmutableMap.of("contract", entry.get()));

				System.out.println(result);

				System.out.println("Contract returned\n");
				res.type("text/json");
				return result;
				// res.status(200);
				/*res.raw().setContentType("text/json");
				try {
					res.raw().getOutputStream().print(result);
					res.raw().getOutputStream().close();
				} catch (IOException e) {
					throw new RuntimeException(e);
				}*/
			} else {
				System.out.println("entry not present");
				res.status(404);
				//res.body("Contract ID does not exist or you do not have access");
				System.out.println("Contract does not exist");
				return "Contract ID does not exist or you do not have access";
			}
		}
	}

	/**
	 * Returns the generated PDF.
	 */
	/*private static class SavedContractHandler implements Route {
		public Object handle(Request req, Response res) {
			QueryParamsMap qm = req.queryMap();
			System.out.println(qm.toMap());
	
			Optional<String> googleId = getGoogleID(qm.value("id_token"));
	
			ContractData contractData = getContractDataFromParams(qm,
					googleId.get());
			googleId.ifPresent(id -> contractStore.updateContract(contractStore.createContract(id), id, contractData));
			System.out.println(contractStore.getAllContracts());
			
			res.raw().setContentType("application/pdf");
			try {
				PDFCreator.buildPDF(res.raw().getOutputStream(), contractData);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
	
			return null;
		}
	}*/

	/*private static ContractData getContractDataFromParams(QueryParamsMap qm,
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
	}*/

	/*private static ClassData getClassDataFromParams(QueryParamsMap qm, int index) {
		return new ClassData(qm.value("Course number" + index), qm.value("Course name" + index),
				(qm.value("internship" + index) != null), qm.value("session" + index), qm.value("Instructor" + index));
	}*/
	

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
