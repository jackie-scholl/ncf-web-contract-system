package edu.ncf.contractform;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class SQLiteContractManagerTest {
	private SQLiteContractManager instance;
	private final static String testDatabaseUrl = "ContractsTestDatabase.db";
	
	@Before
	public void setUp() throws IOException {
		deleteDatabaseFile();
		this.instance = SQLiteContractManager.getTest(testDatabaseUrl);
	}
	
	private static void deleteDatabaseFile() throws IOException {
		try {
		    Files.delete(FileSystems.getDefault().getPath(testDatabaseUrl));
		} catch (NoSuchFileException x) {}
	}

	@After
	public void tearDown() throws IOException {
		deleteDatabaseFile();
	}

	@Test
	public void testGetAllContracts() {
		assertNotNull(instance.getAllContracts());
	}
	
	@Test
	public void testTableIsEmpty() {
		assertEquals(instance.getAllContracts().size(), 0);
	}

}
