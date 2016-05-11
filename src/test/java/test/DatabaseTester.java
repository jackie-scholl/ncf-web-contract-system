package test;


import org.junit.Test;

import edu.ncf.contractform.SQLiteContractManager;
import edu.ncf.contractform.SQLiteContractManagerTest;

import static org.junit.Assert.*;

/**
 *
 * @author Devon Powell
 */
public class DatabaseTester {
    
    public DatabaseTester() {
    }
    
    
    /*@Test
    public void testCreateTable() {
        System.out.println("Now creating table");
        JsonDatabaseManager.instance().createTables();
    }*/
    
    @Test
    public void testGetAllContractsNotNull() {
    	assertNotNull("should not be null", SQLiteContractManager.getDefault().getAllContracts());
    }
    
}
