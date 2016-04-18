package edu.ncf.contractform;

import java.util.Set;

import spark.QueryParamsMap;

import java.sql.*;
import java.util.HashSet;

public class DatabaseManager {
    
    /* Don't use this
    public static Set<String> getUsernames() {
        Connection c = null;
        Statement stmt = null;
        try {
            c = DriverManager.getConnection("jdbc:sqlite:ContractsNCF.db");
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            String sql = "SELECT Username FROM Accounts;";
            ResultSet result = stmt.executeQuery(sql);
            Set<String> usernames = new HashSet<>();
            while (result.next()) {
                usernames.add(result.getString("Username"));
            }
            stmt.close();
            c.close();
            return usernames;
        } catch (Exception e) {
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
            System.exit(0);
        }
        System.out.println("Table created successfully");
        return null;
    }
    */
    
    public static void saveNewContract(String googleId, ContractData cd) {
    	Connection c = null;
        Statement stmt = null;
        try {
            c = DriverManager.getConnection("jdbc:sqlite:ContractsNCF.db");
            c.setAutoCommit(false);
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            String sql = "INSERT INTO Contracts VALUES ("
                    + "\'" + googleId + "\', "
                    + "\'" + cd.nNumber + "\', "
                    + "\'" + cd.firstName + "\', "
                    + "\'" + cd.lastName + "\', "
                    + "\'" + cd.semester + "\', "
                    + "\'" + cd.contractYear + "\', "
                    + "\'" + cd.studyLocation + "\', "
                    + "\'" + cd.expectedGradYear + "\', "
                    + "\'" + cd.boxNumber + "\', "
                    + "\'" + cd.goals + "\', "
                    + "\'" + cd.certificationCriteria + "\', "
                    + "\'" + cd.descriptionsOtherActivities + "\', "
                    + "\'" + cd.advisorName + "\');";
            stmt.executeUpdate(sql);
            
            //cd.classes;
            
            //sql = "INSERT INTO Classes VALUES ("

            stmt.close();
            c.commit();
            c.close();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
            System.exit(0);
        }
        System.out.println("Records created successfully");
    }
    
    public static void dropTables() {
    	Connection c = null;
        Statement stmt = null;
        try {
            //Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:ContractsNCF.db");
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            
            stmt.execute("DROP TABLE IF EXISTS Classes;");
            stmt.execute("DROP TABLE IF EXISTS Contracts;");
        } catch (SQLException e) {
        	throw new RuntimeException(e);
        }
    }

    public static void createTables() {
        Connection c = null;
        Statement stmt = null;
        try {
            //Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:ContractsNCF.db");
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            
            String createStudentsTable = "CREATE TABLE Contracts ("
                    + "GoogleID              VarChar           NOT NULL, "
                    + "StudentID             int, "
                    + "FirstName             VarChar(20), "
                    + "LastName              VarChar(20), "
                    + "Semester              VarChar(6), "
                    + "Year                  int, "
                    + "onCampusStudy         VarChar(5), "
                    + "ExpectedGraduationYear int, "
                    + "BoxNumber             int, "
                    + "Goals                 Text, "
                    + "CertificationCriteria Text, "
                    + "OtherActivities       Text, "
                    + "AdvisorName           VarChar(20), "
                    + "AdvisorSignature      VarChar(256), "
                    + "AdvisorSignDate       Date, "
                    + "StudentSignature      VarChar(256), "
                    + "StudentSignDate       Date, "
                    + "PRIMARY KEY (GoogleID)"
                    + ")";
            stmt.executeUpdate(createStudentsTable);
            
            String createClassesTable = "CREATE TABLE Classes ("
                    + "G_ID                  VarChar         NOT NULL, "
                    + "Sem                   VarChar(6)      NOT NULL, "
                    + "Yr                    int             NOT NULL, "
                    + "CourseCode            int, "
                    + "CourseName            VarChar(20)     NOT NULL, "
                    + "Internship            VarChar(5), "
                    + "Session               VarChar(3), "
                    + "InstructorName        VarChar(20), "
                    + "PRIMARY KEY (G_ID, Sem, Yr, CourseName), "
                    + "FOREIGN KEY (G_ID) REFERENCES Students(GoogleID), "
                    + "FOREIGN KEY (Sem) REFERENCES Students(Semester), "
                    + "FOREIGN KEY (Yr) REFERENCES Students(Year) "
                    + ")";
            stmt.execute(createClassesTable);
            
            stmt.close();
            c.close();
            System.out.println("Tables created successfully");
        } catch (Exception e) {
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
        }
    }

    //This is the update for String values
    public static void updateAccount(String username, String field,
            String value) {
        Connection c = null;
        Statement stmt = null;
        try {
            c = DriverManager.getConnection("jdbc:sqlite:ContractsNCF.db");
            c.setAutoCommit(false);
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            String sql = "UPDATE Accounts set \'" + field + "\' = \'"
                    + value + "\' " + "where Username = \'" + username + "\';";
            stmt.executeUpdate(sql);
            c.commit();

            stmt.close();
            c.close();
        } catch (Exception e) {
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
            System.exit(0);
        }
        System.out.println("Update done successfully");
    }

}
