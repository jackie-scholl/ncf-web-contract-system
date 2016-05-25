package edu.ncf.contractform;

import java.util.Arrays;
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
	
	public String toJson() {
		return new Gson().toJson(this);
	}
	
	public static ContractData fromJson(String json) {
		return new Gson().fromJson(json, ContractData.class);
	}
	
	public void normalize(boolean errorOnIssues) {
		if (this.classes == null) {
			if (errorOnIssues) {
				throw new IllegalArgumentException("classes must not be null");
			}
			this.classes = new ClassData[]{};
		}
		if (classes.length > 9) {
			if (errorOnIssues) {
				throw new IllegalArgumentException("classes must have no more than 9 entries, due to room on sheet");
			}
			this.classes = Arrays.copyOf(classes, 9);
		}
		for (int i=0; i<classes.length; i++) {
			ClassData d = classes[i];
			if (d == null) {
				if (errorOnIssues) {
					throw new IllegalArgumentException("Null class at index "+i);
				}
				d = new ClassData();
				classes[i] = d;
			}
			d.normalize(errorOnIssues);
		}
		
		if (this.semester == null) {
			this.semester = "";
		}
		
		if (!LEGAL_SEMESTERS.contains(this.semester)) {
			throw new IllegalArgumentException("Semester must be one of " + LEGAL_SEMESTERS + " but was "+semester);
		}
		
		
		
	}
	
	private static String emptyToNull(String s) {
		return (s.equals(""))? null : s;
	}
	
	public String toString() {
		return toJson();
	}

	public final static Set<String> LEGAL_SEMESTERS = ImmutableSet.copyOf(new String[] { "", "Fall", "Spring" });
	public final static Set<String> LEGAL_STUDY_LOCATIONS = ImmutableSet.copyOf(new String[] { "", "On Campus", "Off Campus" });
	
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
	
	public void normalize(boolean errorOnIssues) {
		if (sessionName != null && !sessionName.equals("") && !LEGAL_SESSIONS.contains(sessionName)) {
			throw new IllegalArgumentException("Illegal session name "+sessionName+"; Session name must be one of the following: " + LEGAL_SESSIONS);
		}
	}
	
	public boolean isEmpty() {
		return isEmpty(courseCode)
				&& isEmpty(courseName)
				&& (isInternship == null || isInternship.booleanValue() == false)
				&& isEmpty(instructorName)
				&& isEmpty(sessionName);
	}
	
	private static boolean isEmpty(String str) {
		return str == null || str.equals("");
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