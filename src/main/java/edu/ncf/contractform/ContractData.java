package edu.ncf.contractform;

import java.util.Calendar;
import java.util.Optional;
import java.util.Set;

import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;

public class ContractData {
	public String semester;
	public String contractYear;
	public String lastName;
	public String firstName;
	public String nNumber;
	public String expectedGradYear;
	public String boxNumber;
	public String goals;
	public String certificationCriteria;
	public String descriptionsOtherActivities;
	public ClassData[] classes;
	public String advisorName;
	public String studyLocation;
	
	public static ContractData getDefault(String firstName, String lastName) {
		ContractData defaultContract = new ContractData();
		defaultContract.firstName = Optional.ofNullable(firstName).orElse("");
		defaultContract.lastName = Optional.ofNullable(lastName).orElse("");
		
		defaultContract.studyLocation = "On Campus";
		
		Calendar now = Calendar.getInstance();
		int month = now.get(Calendar.MONTH);
		if (month == Calendar.AUGUST || month == Calendar.SEPTEMBER) {
			defaultContract.semester = Semester.FALL.fieldName;
		} else if (month == Calendar.JANUARY || month == Calendar.FEBRUARY) {
			defaultContract.semester = Semester.SPRING.fieldName;
		}
		defaultContract.contractYear = String.valueOf(now.get(Calendar.YEAR));
		
		ClassData defaultClass = new ClassData("", "", false, "", "");
		defaultContract.classes = new ClassData[]{defaultClass, defaultClass, defaultClass, defaultClass};
		
		return defaultContract;
	}
	
	public String toJson() {
		return new Gson().toJson(this);
	}
	
	public static ContractData fromJson(String json) {
		return new Gson().fromJson(json, ContractData.class);
	}
	
	public String toString() {
		return toJson();
	}

	public final static Set<String> LEGAL_SEMESTERS = ImmutableSet.copyOf(new String[] { "Fall", "Spring" });
}

class ClassData {
	public String courseCode;
	public String courseName;
	public Boolean isInternship;
	public String instructorName;
	public String sessionName;

	public ClassData() {}

	public ClassData(String courseCode, String courseName, Boolean isInternship, String sessionName,
			String instructorName) {
		super();
		this.courseCode = courseCode;
		this.courseName = courseName;
		this.isInternship = isInternship;
		this.instructorName = instructorName;
		if (sessionName == null || sessionName.equals("")) {
			this.sessionName = "";
		} else if (LEGAL_SESSIONS.contains(sessionName)) {
			this.sessionName = sessionName;
		} else {
			throw new IllegalArgumentException("Illegal session name "+sessionName+"; Session name must be one of the following: " + LEGAL_SESSIONS);
		}
	}

	public ClassData(String courseCode, String courseName, Boolean isInternship, Session session,
			String instructorName) {
		this(courseCode, courseName, isInternship, session.fieldName, instructorName);
	}

	public final static Set<String> LEGAL_SESSIONS = ImmutableSet.copyOf(new String[] { "A", "M1", "M2", "1MC" });
}

enum Semester {
	FALL("Fall"), SPRING("Spring");
	public final String fieldName;

	Semester(String fieldName) {
		this.fieldName = fieldName;
	}
}

enum Session {
	/**
	 * Full term
	 */
	A("A"), /**
			 * Module one
			 */
	M1("M1"), /**
				 * Module two
				 */
	M2("M2"), /**
				 * Full term for Module Credit Equivalent
				 */
	ONE_MC("1MC");

	public final String fieldName;

	Session(String fieldName) {
		this.fieldName = fieldName;
	}
}