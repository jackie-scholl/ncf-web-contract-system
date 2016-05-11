package test;


import org.junit.Test;
import edu.ncf.contractform.JsonDatabaseManager;

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
    	assertNotNull("should not be null", JsonDatabaseManager.instance().getAllContracts());
    }
    
}
