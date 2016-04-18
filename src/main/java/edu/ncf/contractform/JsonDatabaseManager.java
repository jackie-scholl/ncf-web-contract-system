package edu.ncf.contractform;

import com.google.common.collect.ImmutableList;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class JsonDatabaseManager {

	public static void main(String[] args) {
		createTables();
		selectContracts();
	}

	private static void executeStatement(String statement) {
		try {
			Connection c = DriverManager.getConnection("jdbc:sqlite:JSONContractsNCF.db");
			Statement stmt = c.createStatement();
			System.out.println(statement);
			stmt.execute(statement);
			stmt.close();
			c.close();
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public static void createTables() {
		String createStudentsTable = "CREATE TABLE IF NOT EXISTS Contracts ("
				+ "ContractID            INTEGER PRIMARY KEY NOT NULL, "
				+ "GoogleID              VarChar           NOT NULL, "
				+ "ContractData          VarChar           NOT NULL"
				+ ");";
		executeStatement(createStudentsTable);
	}

	public static void dropTables() {
		executeStatement("DROP TABLE IF EXISTS Contracts;");
	}

	public static long createContract(String googleID) {
		try {
			Connection c = DriverManager.getConnection("jdbc:sqlite:JSONContractsNCF.db");
			c.setAutoCommit(false);
			PreparedStatement pstmt = c
					.prepareStatement("INSERT INTO Contracts  (GoogleID, ContractData) VALUES (?, '{}');");
			pstmt.setString(1, googleID);
			pstmt.execute();
			ResultSet rs = c.createStatement().executeQuery("SELECT last_insert_rowid();");
			long rowId = rs.getLong(1);
			c.commit();
			return rowId;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public static void selectContracts() {
		try {
			Connection c = DriverManager.getConnection("jdbc:sqlite:JSONContractsNCF.db");
			ResultSet rs = c.createStatement()
					.executeQuery("SELECT _rowid_, ContractID, GoogleID, ContractData FROM Contracts;");

			ResultSetMetaData rsmd = rs.getMetaData();
			int columnsNumber = rsmd.getColumnCount();

			// Iterate through the data in the result set and display it.
			while (rs.next()) {
				// Print one row
				for (int i = 1; i <= columnsNumber; i++) {
					System.out.print(rs.getString(i) + " "); // Print one element of a row
				}
				System.out.println();// Move to the next line to print the next row.
			}
			
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	public static void updateContractData(long contractID, String newData) {
		try {
			Connection c = DriverManager.getConnection("jdbc:sqlite:JSONContractsNCF.db");
			
			PreparedStatement pstmt = c.prepareStatement("UPDATE Contracts SET ContractData=? WHERE ContractID=?");
			pstmt.setString(1, newData);
			pstmt.setLong(2, contractID);
			pstmt.execute();			
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	public static void updateContractData(long contractID, ContractData newData) {
		updateContractData(contractID, newData.toJSON());
	}

	public static void saveNewContract(String googleID, ContractData data) {
		long contractID = createContract(googleID);
		updateContractData(contractID, data);
	}
	
	public static String getContractRaw(long contractID) {
		try {
			Connection c = DriverManager.getConnection("jdbc:sqlite:JSONContractsNCF.db");
			
			PreparedStatement pstmt = c.prepareStatement("SELECT ContractData FROM Contracts WHERE ContractID=?");
			pstmt.setLong(1, contractID);
			ResultSet rs = pstmt.executeQuery();
			return rs.getString(1);
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	public static ContractData getContractData(long contractID) {
		return ContractData.fromJson(getContractRaw(contractID));
	}
	
	public static List<Long> getUserContracts(String googleID) {
		try {
			Connection c = DriverManager.getConnection("jdbc:sqlite:JSONContractsNCF.db");
			
			PreparedStatement pstmt = c.prepareStatement("SELECT ContractID FROM Contracts WHERE GoogleID=?");
			pstmt.setString(1, googleID);
			ResultSet rs = pstmt.executeQuery();
			List<Long> resultList = new ArrayList<>();
			while (rs.next()) {
				resultList.add(rs.getLong(1));
			}
			ImmutableList.copyOf(resultList);
			return resultList;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	public static String getContractOwner(long contractID) {
		try {
			Connection c = DriverManager.getConnection("jdbc:sqlite:JSONContractsNCF.db");
			
			PreparedStatement pstmt = c.prepareStatement("SELECT GoogleID FROM Contracts WHERE ContractID=?");
			pstmt.setLong(1, contractID);
			ResultSet rs = pstmt.executeQuery();
			return rs.getString(1);
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
}
