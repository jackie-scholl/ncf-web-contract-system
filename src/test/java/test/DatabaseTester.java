package test;


import org.junit.Test;
import edu.ncf.contractform.DatabaseManager;

/**
 *
 * @author Devon Powell
 */
public class DatabaseTester {
    
    public DatabaseTester() {
    }
    
    @Test
    public void testInsertAccount() {
        System.out.println("Now inserting account");
        DatabaseManager.insertNewAccount("JackRocks2", "Password", "Jack", "Black");
        DatabaseManager.insertNewAccount("Bob2", "PassForBob", "Bob", "Ross");
    }
    
    @Test
    public void testGetUsernames() {
        System.out.println("Now getting usernames");
        System.out.println(DatabaseManager.getUsernames());
    }
    
    //@Test
    public void testCreateTable() {
        System.out.println("Now creating table");
        DatabaseManager.createTables();
    }
    
}
