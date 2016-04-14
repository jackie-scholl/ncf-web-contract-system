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

    //    try {
      //      DatabaseManager.createTables();
       // } catch (Exception e) {
        //    e.printStackTrace();
        //}

        Spark.get("/contract", new WelcomePageStarter(), freeMarker);
        Spark.post("/play", new PlayHandler(), freeMarker);
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
                    .put("newUsername", "")
                    .put("newPassword", "")
                    .put("newFirstName", "")
                    .put("newLastName", "")
                    .put("title", "Boggle: Play")
                    //.put("usernamesTaken", usernamesTaken.toString())
                    .put("currentTotalScore", 0)
                    .put("percentScore", 0)
                    .put("averageScore", 0)
                    .put("maxScore", 0)
                    .put("numberOfGames", 0).build();
            return new ModelAndView(variables, "contract.ftl");
        }
    }

    /**
     * Makes a new board, and loads previous scores.
     */
    private static class PlayHandler implements TemplateViewRoute {

        @Override
        public ModelAndView handle(Request req, Response res) {

            //Get codes from results in order to keep them in the next round
            QueryParamsMap qm = req.queryMap();
            String timeChosen = qm.value("timeChosen");
            String currentTotalScoreRead = qm.value("currentTotalScore");
            String percentScoreRead = qm.value("percentScore");
            String averageScoreRead = qm.value("averageScore");
            String maxScoreRead = qm.value("maxScore");
            String numberOfGamesRead = qm.value("numberOfGames");

            //New account login information
            String newUsername = qm.value("newUsername");
            String newPassword = qm.value("newPassword");
            String newFirstName = qm.value("newFirstName");
            String newLastName = qm.value("newLastName");
            Set<String> usernamesTaken = DatabaseManager.getUsernames();

            //What should be in JavaScript / temp way to quick close the server.
            if (!usernamesTaken.contains(newUsername)) {
                DatabaseManager.insertNewAccount(newUsername, newPassword,
                        newFirstName, newLastName);
            } else {
                newUsername = "Anon";
                Spark.stop();
            }

            int time = Integer.parseInt(timeChosen);
            Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
                    .put("title", "Boggle: Results")
                    .put("time", time)
                    .put("username", newUsername)
                    .put("currentTotalScore", currentTotalScoreRead)
                    .put("percentScore", percentScoreRead)
                    .put("averageScore", averageScoreRead)
                    .put("maxScore", maxScoreRead)
                    .put("numberOfGames", numberOfGamesRead).build();
            return new ModelAndView(variables, "play.ftl");
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

            Iterable<String> guesses
                    = BREAKWORDS.split(qm.value("guesses").toLowerCase());

            SortedSet<String> good = new TreeSet<>();
            SortedSet<String> bad = new TreeSet<>();

            String currentTotalScoreReadAttempt = qm.value("currentTotalScore");
            String percentScoreReadAttempt = qm.value("percentScore");
            String averageScoreReadAttempt = qm.value("averageScore");
            String maxScoreReadAttempt = qm.value("maxScore");
            String numberOfGamesReadAttempt = qm.value("numberOfGames");
            String username = qm.value("username");
            if (username.equals("Anon") || username.equals("")) {
                username = "Anon";
            }

            if (currentTotalScoreReadAttempt.equals("")
                    && averageScoreReadAttempt.equals("")
                    && maxScoreReadAttempt.equals("")
                    && numberOfGamesReadAttempt.equals("")) {
                currentTotalScoreReadAttempt = averageScoreReadAttempt
                        = maxScoreReadAttempt = numberOfGamesReadAttempt
                        = percentScoreReadAttempt = "0";
            }

            Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
                    .put("title", "Boggle: Results")
                    .put("good", good)
                    .put("bad", bad)
                    .put("username", username)
                    .put("time", qm.value("timeChosen")).build();
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
