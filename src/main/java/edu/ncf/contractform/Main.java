package edu.ncf.contractform;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import spark.ExceptionHandler;
import spark.Request;
import spark.Response;
import spark.Spark;

public class Main {
	private static final boolean REQUIRE_GOOGLE = false;

	public static void main(String[] args) {
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

		Spark.get("/render-contract", Main::renderContractPDF);
	}

	private static Object renderContractPDF(Request req, Response res) {
		long start = System.currentTimeMillis();

		res.raw().setContentType("application/pdf");
		try {
			RenderContractRequest.renderContractPDF(req.queryParams("renderContractRequest"),
					res.raw().getOutputStream(), REQUIRE_GOOGLE);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		System.out.println("Time to construct PDF: " + (System.currentTimeMillis() - start));

		return null;
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
