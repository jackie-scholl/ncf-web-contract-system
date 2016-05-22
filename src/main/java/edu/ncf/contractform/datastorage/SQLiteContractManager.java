package edu.ncf.contractform.datastorage;

import com.google.common.collect.ImmutableList;
import com.google.common.primitives.Longs;

import edu.ncf.contractform.ContractData;

import java.sql.*;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

public class SQLiteContractManager implements ContractStore {
	private static final String LOCAL_DB_URL = "jdbc:sqlite:JSONContractsNCF.db";
	private final String dbUrl;
	
	public static void main(String[] args) {
		for (ContractEntry e : getDefault().getAllContracts()) {
			System.out.println(e);
		}
	}
	
	public static ContractStore getDefault() {
		return new SQLiteContractManager(LOCAL_DB_URL);
	}
	
	static SQLiteContractManager getTest(String testDatabaseName) {
		return new SQLiteContractManager("jdbc:sqlite:" + testDatabaseName);
	}
	
	private SQLiteContractManager(String dbUrl) {
		this.dbUrl = dbUrl;
		createTableIfNeeded();
	}
	
	private void executeStatement(String statement) {
		try (Connection c = DriverManager.getConnection(dbUrl)) {
			Statement stmt = c.createStatement();
			stmt.execute(statement);
			stmt.close();
			c.close();
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public void createTableIfNeeded() {
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

	public String createContract(String googleId, ContractData initialData) {
		try (Connection c = DriverManager.getConnection(dbUrl)) {
			c.setAutoCommit(false);
			PreparedStatement pstmt = c
					.prepareStatement("INSERT INTO Contracts  (GoogleID, ContractData, DateLastModified) VALUES (?, ?, ?);");
			pstmt.setString(1, googleId);
			pstmt.setString(2, initialData.toJson());
			pstmt.setLong(3, System.currentTimeMillis());
			pstmt.execute();
			ResultSet rs = c.createStatement().executeQuery("SELECT last_insert_rowid();");
			long rowId = rs.getLong(1);
			c.commit();
			return longToBase64(rowId);
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public void updateContract(String contractId, String googleId, ContractData newData) {
		try (Connection c = DriverManager.getConnection(dbUrl)) {
			PreparedStatement pstmt = c
					.prepareStatement("UPDATE Contracts SET ContractData=?, DateLastModified=? WHERE ContractID=? AND GoogleID=?;");
			pstmt.setString(1, newData.toJson());
			pstmt.setLong(2, System.currentTimeMillis());
			pstmt.setLong(3, base64ToLong(contractId));
			pstmt.setString(4, googleId);
			pstmt.execute();
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	public Optional<ContractEntry> getContract(String contractId, String googleId) {
		try (Connection c = DriverManager.getConnection(dbUrl)) {

			PreparedStatement pstmt = c.prepareStatement(
					"SELECT ContractID, GoogleID, ContractData, DateLastModified FROM Contracts WHERE ContractID=? AND GoogleID=?;");
			pstmt.setLong(1, base64ToLong(contractId));
			pstmt.setString(2, googleId);
			ResultSet rs = pstmt.executeQuery();
			if (!rs.next()) {
				return Optional.empty();
			}
			return Optional.of(new ContractEntry(longToBase64(rs.getLong(1)), rs.getString(2), ContractData.fromJson(rs.getString(3)),
					rs.getLong(4)));
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}

	public List<ContractEntry> getContractsByGoogleId(String googleId) {
		try (Connection c = DriverManager.getConnection(dbUrl)) {

			PreparedStatement pstmt = c.prepareStatement(
					"SELECT ContractID, GoogleID, ContractData, DateLastModified FROM Contracts WHERE GoogleID=?;");
			pstmt.setString(1, googleId);
			ResultSet rs = pstmt.executeQuery();
			List<ContractEntry> resultList = new ArrayList<>();
			while (rs.next()) {
				resultList.add(new ContractEntry(longToBase64(rs.getLong(1)), rs.getString(2), ContractData.fromJson(rs.getString(3)),
						rs.getLong(4)));
			}
			return ImmutableList.copyOf(resultList);
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	public List<ContractEntry> getAllContracts() {
		try (Connection c = DriverManager.getConnection(dbUrl)) {
			PreparedStatement pstmt = c.prepareStatement(
					"SELECT ContractID, GoogleID, ContractData, DateLastModified FROM Contracts;");
			ResultSet rs = pstmt.executeQuery();
			List<ContractEntry> resultList = new ArrayList<>();
			while (rs.next()) {
				resultList.add(new ContractEntry(longToBase64(rs.getLong(1)), rs.getString(2), ContractData.fromJson(rs.getString(3)),
						rs.getLong(4)));
			}
			return ImmutableList.copyOf(resultList);
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	
	private static String longToBase64(long contractId) {
		return Base64.getUrlEncoder().encodeToString(Longs.toByteArray(contractId));
	}

	private static long base64ToLong(String contractId) {
		return Longs.fromByteArray(Base64.getUrlDecoder().decode(contractId));
	}
}