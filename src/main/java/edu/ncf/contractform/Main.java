package edu.ncf.contractform;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import edu.ncf.contractform.datastorage.ContractEntry;
import edu.ncf.contractform.datastorage.ContractStore;
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
		Spark.setPort(4232);

		// We need to serve some simple static files containing CSS and JavaScript.
		// This tells Spark where to look for urls of the form "/static/*".
		Spark.externalStaticFileLocation("target/resources");

		// Development is easier if we show exceptions in the browser.
		Spark.exception(Exception.class, new ExceptionPrinter());

		contractStore = ContractStore.getDefaultContractStore();

		Spark.get("/contracts/:contractId/pdf", new PDFContractHandler());
		Spark.get("/api/contracts", "text/json", new ApiContractList());
		Spark.get("/api/contracts/:contractId", "text/json", new LoadContractHandler());
		Spark.post("/api/contracts/:contractId/save", "text/json", new SaveContractHandler());
		Spark.post("/api/contracts", "text/json", new AddContract());
		
		Spark.get("/renderContract", new RenderContractPDF());
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

			String googleId = GooglePayload.fromRequest(req).googleId();

			//System.out.printf("Time taken so far (got google id): %d ms%n", System.currentTimeMillis() - start);

			List<ContractEntry> contractEntries = contractStore.getContractsByGoogleId(googleId);

			//System.out.printf("Time taken so far (got contractEntries): %d ms%n", System.currentTimeMillis() - start);

			String result = new Gson().toJson(ImmutableMap.of("contracts", contractEntries));
			//System.out.println(result);

			//System.out.printf("Time taken so far (result done): %d ms%n", System.currentTimeMillis() - start);

			res.type("text/json");

			//System.out.println("Contract list done\n");

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
				System.out.println("Time to construct PDF: " + (System.currentTimeMillis() - start));
			}

			return null;
		}
	}
	
	private static class RenderContractPDF implements Route {
		public Object handle(Request req, Response res) {
			long start = System.currentTimeMillis();
			GooglePayload.fromRequest(req);

			ContractData contractData = new Gson().fromJson(req.queryParams("contractData"), ContractData.class);

			res.raw().setContentType("application/pdf");
			try {
				PDFCreator.buildPDF(res.raw().getOutputStream(), contractData);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
			System.out.println("Time to construct PDF: " + (System.currentTimeMillis() - start));

			return null;
		}
	}

	private static class SaveContractHandler implements Route {
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
			//System.out.println("Starting to load contract: ");
			String googleId = GooglePayload.fromRequest(req).googleId();
			String contractId = req.params(":contractId");

			Optional<ContractEntry> entry = contractStore.getContract(contractId, googleId);

			if (entry.isPresent()) {
				String result = new Gson()
						.toJson(ImmutableMap.of("contract", entry.get()));

				//System.out.println(result);

				//System.out.println("Contract returned");
				res.type("text/json");
				return result;
			} else {
				System.out.println("Entry not present.");
				res.status(404);
				//res.body("Contract ID does not exist or you do not have access");
				System.out.println("Contract does not exist");
				return "Contract ID does not exist or you do not have access";
			}
		}
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
