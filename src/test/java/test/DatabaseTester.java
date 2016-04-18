package test;


import org.junit.Test;
import edu.ncf.contractform.JsonDatabaseManager;

/**
 *
 * @author Devon Powell
 */
public class DatabaseTester {
    
    public DatabaseTester() {
    }
    
    
    //@Test
    public void testCreateTable() {
        System.out.println("Now creating table");
        JsonDatabaseManager.createTables();
    }
    
}
