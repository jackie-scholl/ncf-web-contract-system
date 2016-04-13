package edu.ncf.contractform;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Set;
import java.util.HashSet;

public class DatabaseManager {
    
    public static Set<String> getUsernames() {
        Connection c = null;
        Statement stmt = null;
        try {
            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:Accounts.db");
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

    public static void createTable() {
        Connection c = null;
        Statement stmt = null;
        try {
            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:Accounts.db");
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            String sql = "CREATE TABLE Accounts "
                    + "(Username             VarChar(20)    PRIMARY KEY     NOT NULL,"
                    + " Password             VarChar(32)                    NOT NULL, "
                    + " FirstName            VarChar(20)                    NOT NULL, "
                    + " LastName             VarChar(20)                    NOT NULL)";
            stmt.executeUpdate(sql);
            stmt.close();
            c.close();
            System.out.println("Table created successfully");
        } catch (Exception e) {
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
        }
    }

    public static void insertNewAccount(String username, String password,
            String firstName, String lastName) {
        Connection c = null;
        Statement stmt = null;
        try {
            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:Accounts.db");
            c.setAutoCommit(false);
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            String sql = "INSERT INTO "
                    + "Accounts (Username,Password,FirstName,LastName) "
                    + "VALUES (\'" + username + "\',\'" + password + "\',\'" +
                    firstName + "\',\'" + lastName + "\');";
            stmt.executeUpdate(sql);

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

    //This is the update for String values
    public static void updateAccount(String username, String field,
            String value) {
        Connection c = null;
        Statement stmt = null;
        try {
            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:Accounts.db");
            c.setAutoCommit(false);
            System.out.println("Opened database successfully");

            stmt = c.createStatement();
            String sql = "UPDATE Accounts set \'" + field + "\' = \'" +
                    value + "\' " + "where Username = \'" + username + "\';";
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
