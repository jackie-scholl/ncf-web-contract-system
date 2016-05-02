package edu.ncf.contractform;

import com.google.common.collect.ImmutableList;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class JsonDatabaseManager implements ContractStore {
	//private static final String DB_URL = "jdbc:sqlite:JSONContractsNCF.db";
	private static final String DB_URL = "jdbc:sqlite:/Users/jackie/Documents/workspace/contract-form/JSONContractsNCF.db";
	
	public static void main(String[] args) {
		instance().showContracts();
	}
	
	private JsonDatabaseManager() {}
	
	private static enum JsonDatabaseManagerSingleton {
		INSTANCE;
		private final JsonDatabaseManager jsonDatabaseManager;

		private JsonDatabaseManagerSingleton() {
			this.jsonDatabaseManager = new JsonDatabaseManager();
			jsonDatabaseManager.createTables();
		}
	}
	
	public static JsonDatabaseManager instance() {
		return JsonDatabaseManagerSingleton.INSTANCE.jsonDatabaseManager;
	}
	
	private void executeStatement(String statement) {
		try (Connection c = DriverManager.getConnection(DB_URL)) {
			Statement stmt = c.createStatement();
			System.out.println(statement);
			stmt.execute(statement);
			stmt.close();
			c.close();
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public void createTables() {
		String createStudentsTable = "CREATE TABLE IF NOT EXISTS Contracts ("
				+ "ContractID            INTEGER PRIMARY KEY NOT NULL, "
				+ "GoogleID              VarChar           NOT NULL, "
				+ "ContractData          VarChar           NOT NULL,"
				+ "DateLastModified      INTEGER           NOT NULL" // represents time in milliseconds since epoch
				+ ");";
		executeStatement(createStudentsTable);
	}

	public void dropTables() {
		executeStatement("DROP TABLE IF EXISTS Contracts;");
	}

	public void showContracts() {
		try (Connection c = DriverManager.getConnection(DB_URL)) {
			ResultSet rs = c.createStatement()
					.executeQuery("SELECT * FROM Contracts;");

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

	public long createContract(String googleID) {
		try (Connection c = DriverManager.getConnection(DB_URL)) {
			c.setAutoCommit(false);
			PreparedStatement pstmt = c
					.prepareStatement("INSERT INTO Contracts  (GoogleID, ContractData, DateLastModified) VALUES (?, '{}', ?);");
			pstmt.setString(1, googleID);
			pstmt.setLong(2, System.currentTimeMillis());
			pstmt.execute();
			ResultSet rs = c.createStatement().executeQuery("SELECT last_insert_rowid();");
			long rowId = rs.getLong(1);
			c.commit();
			return rowId;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public void updateContract(long contractId, String googleId, ContractData newData) {
		try (Connection c = DriverManager.getConnection(DB_URL)) {
			PreparedStatement pstmt = c
					.prepareStatement("UPDATE Contracts SET ContractData=?, DateLastModified=? WHERE ContractID=? AND GoogleID=?");
			pstmt.setString(1, newData.toJson());
			pstmt.setLong(2, System.currentTimeMillis());
			pstmt.setLong(3, contractId);
			pstmt.setString(4, googleId);
			pstmt.execute();
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public void saveNewContract(String googleId, ContractData data) {
		long contractID = createContract(googleId);
		updateContract(contractID, googleId, data);
	}

	public ContractEntry getContractByContractId(long contractId) {
		try (Connection c = DriverManager.getConnection(DB_URL)) {

			PreparedStatement pstmt = c.prepareStatement(
					"SELECT ContractID, GoogleID, ContractData, DateLastModified FROM Contracts WHERE ContractID=?");
			pstmt.setLong(1, contractId);
			ResultSet rs = pstmt.executeQuery();
			if (!rs.next()) {
				throw new IllegalArgumentException("Contract ID "+contractId+" does not exist");
			}
			return new ContractEntry(rs.getLong(1), rs.getString(2), ContractData.fromJson(rs.getString(3)),
					rs.getLong(4));
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public List<ContractEntry> getContractsByGoogleId(String googleId) {
		try (Connection c = DriverManager.getConnection(DB_URL)) {

			PreparedStatement pstmt = c.prepareStatement(
					"SELECT ContractID, GoogleID, ContractData, DateLastModified FROM Contracts WHERE GoogleID=?");
			pstmt.setString(1, googleId);
			ResultSet rs = pstmt.executeQuery();
			List<ContractEntry> resultList = new ArrayList<>();
			while (rs.next()) {
				resultList.add(new ContractEntry(rs.getLong(1), rs.getString(2), ContractData.fromJson(rs.getString(3)),
						rs.getLong(4)));
			}
			ImmutableList.copyOf(resultList);
			return resultList;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	public List<ContractEntry> getAllContracts() {
		try (Connection c = DriverManager.getConnection(DB_URL)) {
			PreparedStatement pstmt = c.prepareStatement(
					"SELECT ContractID, GoogleID, ContractData, DateLastModified FROM Contracts");
			ResultSet rs = pstmt.executeQuery();
			List<ContractEntry> resultList = new ArrayList<>();
			while (rs.next()) {
				resultList.add(new ContractEntry(rs.getLong(1), rs.getString(2), ContractData.fromJson(rs.getString(3)),
						rs.getLong(4)));
			}
			ImmutableList.copyOf(resultList);
			return resultList;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
}