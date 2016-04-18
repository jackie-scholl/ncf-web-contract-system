package edu.ncf.contractform;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.regex.Pattern;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

import freemarker.template.Configuration;
import spark.ExceptionHandler;
import spark.Spark;
import spark.ModelAndView;
import spark.QueryParamsMap;
import spark.Request;
import spark.Response;
import spark.TemplateViewRoute;
import spark.template.freemarker.FreeMarkerEngine;

public class Main {

    /**
     * The below if/else if statements don't actually do anything. Since we
     * aren't running from command line, nothing changes in the options parser.
     * The only part that's needed is runSparkServer();
     *
     * @param args
     */
    public static void main(String[] args) {
        OptionParser parser = new OptionParser();

        parser.accepts("generate");

        OptionSpec<String> solveSpec
                = parser.accepts("solve").withRequiredArg().ofType(String.class);

        OptionSet options = parser.parse(args);

        runSparkServer();
    }

    /**
     * Sets the port, loads the static files for javascript/css, and sets up the
     * server so that you have a play url and a results url.
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
            DatabaseManager.createTables();
        } catch (Exception e) {
            e.printStackTrace();
        }

        Spark.get("/contract", new WelcomePageStarter(), freeMarker);
        Spark.post("/saved", new SavedContractHandler(), freeMarker);
       // Spark.post("/results", new ResultsHandler(), freeMarker);
    }

    /**
     * Serves as the first load of the game. This is called using GET while the
     * PlayHandler is called using POST (since it's a form submission)
     */
    private static class WelcomePageStarter implements TemplateViewRoute {

        @Override
        public ModelAndView handle(Request rqst, Response rspns) {
            //Set<String> usernamesTaken = DatabaseManager.getUsernames();
            Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
                    .put("title", "Contract Form").build();
            return new ModelAndView(variables, "contract.ftl");
        }
    }

    /**
     * Makes a new board, and loads previous scores.
     */
    private static class SavedContractHandler implements TemplateViewRoute {

        @Override
        public ModelAndView handle(Request req, Response res) {
            QueryParamsMap qm = req.queryMap();
            
            Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
                    .put("title", "Boggle: Results")
                    .put("time", 5).build();
            
            return new ModelAndView(variables, "contractSaved.ftl");
        }
    }

    /**
     * Makes the results screen using the same board and results from
     * PlayHandler.
     */
    private static class ResultsHandler implements TemplateViewRoute {

        @Override
        public ModelAndView handle(Request req, Response res) {
            QueryParamsMap qm = req.queryMap();
            
            //Put more code here

            Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
                    .put("title", "Boggle: Results")
                    .put("time", 5).build();
            return new ModelAndView(variables, "results.ftl");
        }

        private static final Splitter BREAKWORDS
                = Splitter.on(Pattern.compile("\\W+")).omitEmptyStrings();
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
