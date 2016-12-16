package edu.ncf.contractform.classes_database;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

public class Main {
	public static void main(String[] args) {
        // Create a new instance of the Firefox driver
        // Notice that the remainder of the code relies on the interface, 
        // not the implementation.

		System.setProperty("webdriver.gecko.driver", "/Users/jackie/Downloads/geckodriver");
        WebDriver driver = new FirefoxDriver();

        getCourseData(driver);
        
        System.out.println("\n");
        
        getCourseDescriptions(driver, "SAN");
        
        //Close the browser
        driver.quit();
    }
	
	private static void getCourseData(WebDriver driver) {
		long startTime = System.currentTimeMillis();
		driver.manage().addCookie(new Cookie("SESSID", "TkZBMTM4MTc1OTA5Mg=="));
		driver.get("https://banner.ncf.edu/pls/ncpo/bwckgens.p_proc_term_date");
		
        // Wait for the page to load, timeout after 60 seconds
        (new WebDriverWait(driver, 10)).until(new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver d) {
                return d.getTitle().toLowerCase().startsWith("class");
            }
        });
        
        System.out.println("time: " + (System.currentTimeMillis() - startTime)/1000.0);
        
        System.out.println(driver.getTitle());
        
        WebElement element = driver.findElement(By.className("datadisplaytable"));
        WebElement element2 = element.findElement(By.tagName("tbody"));
        
        List<WebElement> titles = element2.findElements(By.className("ddtitle"));
        List<WebElement> descriptions = element2.findElements(By.className("dddefault"));
        System.out.println(titles.size());
        System.out.println(descriptions.size());
        
        int size = titles.size();
        
        for (int i=0; i<size; i++) {
        	String title = titles.get(i).getText();
        	String[] titleParts = title.split("-");
        	String className = titleParts[0].trim();
        	String classCode = titleParts[1].trim();
        	String referenceCode = titleParts[2].trim();
        	
        	String instructor = descriptions.get(i)
        			.findElement(By.cssSelector(".datadisplaytable > tr:last-child > td:last-child"))
        			.getText()
        			.split("\\(")[0];
        	System.out.printf("%s : %s : %s : %s%n", className, classCode, referenceCode, instructor);
        	
        	//String description = descriptions.get(i).getText().split("\\n")[0];
        	//System.out.println(title + ": " + description);
        }
	}
	
	private static Map<String, String> getCourseDescriptions(WebDriver driver, String subjectCode) {
		long startTime = System.currentTimeMillis();
		driver.get("https://banner.ncf.edu/pls/ncpo/bwckctlg.p_display_courses?term_in=201702&one_subj="+subjectCode+
				"&sel_crse_strt=0&sel_crse_end=9999&sel_subj=&sel_levl=&sel_schd=&sel_coll=&sel_divs=&sel_dept=&sel_attr=");
        
        System.out.println("time: " + (System.currentTimeMillis() - startTime)/1000.0);
        
        System.out.println(driver.getTitle());
        //System.out.println(element2.getText());
        
        WebElement element = driver.findElement(By.className("datadisplaytable"));
        WebElement element2 = element.findElement(By.tagName("tbody"));
        
        List<WebElement> titles = element2.findElements(By.className("nttitle"));
        List<WebElement> descriptions = element2.findElements(By.className("ntdefault"));
        System.out.println(titles.size());
        System.out.println(descriptions.size());
        
        int size = titles.size();
        
        Map<String, String> descriptionMap = new HashMap<>();
        
        for (int i=0; i<size; i++) {
        	String title = titles.get(i).getText();
        	String reference_code = title.split("-")[0].trim();
        	String description = descriptions.get(i).getText().split("\\n")[0];
        	System.out.println(title + ": " + description);

        	descriptionMap.put(reference_code, description);
        }
        System.out.println(descriptionMap);
        return descriptionMap;
	}
}
