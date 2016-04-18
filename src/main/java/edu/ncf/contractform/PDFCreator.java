package edu.ncf.contractform;

import java.io.*;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDCheckBox;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;

public class PDFCreator {
	public static void main(String[] args) throws IOException {
		oldBuildPDF();
		ContractData data = new ContractData();
		data.semester = Semester.FALL;
		data.year = "2015";
		data.lastName = "Scholl";
		data.firstName = "Jackie";
		data.nNumber = "123456789";
		data.expectedGradYear = "2019";
		data.boxNumber = "862";
		data.goals = "don't die?";
		data.certificationCriteria = "Three out of four units. (3/4)";
		data.descriptionsOtherActivities = "maybe fly a plane idk";
		data.advisorName = "David Gillman";

		data.classes = new ClassData[] {
				new ClassData("80141", "Computer Networks", false, Session.A, "Matthew Lepinski"),
				new ClassData("80142", "Distributed Computing", false, Session.M1, "David Gillman"),
				new ClassData("80142", "Distributed Computing", false, Session.M2, "David Gillman"),
				new ClassData("80142", "Distributed Computing", false, Session.ONE_MC, "David Gillman"),
				new ClassData("80142", "Distributed Computing", true, Session.A, "David Gillman"),
		};
		
		buildPDFToDisk(data);
	}

	public static void oldBuildPDF() throws IOException {

		InputStream formTemplateStream = PDFCreator.class.getResourceAsStream("/Contract.pdf");

		System.out.println(formTemplateStream);

		// load the document
		PDDocument pdfDocument = PDDocument.load(formTemplateStream);

		// get the document catalog
		PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();

		// as there might not be an AcroForm entry a null check is necessary
		if (acroForm != null) {
			for (PDField x : acroForm.getFields()) {
				System.out.println(x.getFullyQualifiedName());
			}

			System.out.println("\n\n\n");

			((PDTextField) acroForm.getField("Fall")).setValue("2015");

			((PDTextField) acroForm.getField("Name")).setValue("Scholl");
			((PDTextField) acroForm.getField("First")).setValue("Jackie");
			((PDTextField) acroForm.getField("N")).setValue("12345678");
			((PDTextField) acroForm.getField("Expected Year of Graduation")).setValue("2019");
			((PDTextField) acroForm.getField("Box No")).setValue("862");
			((PDTextField) acroForm.getField("GOALS Specify Short and Long Term")).setValue("don't die?");

			((PDTextField) acroForm.getField("courses only 1")).setValue("80141");
			((PDTextField) acroForm.getField("Course Name 1")).setValue("Computer Networks");
			((PDTextField) acroForm.getField("1MC")).setValue("Matthew Lepinski");
			((PDCheckBox) acroForm.getField("Session A 1")).check();

			((PDTextField) acroForm.getField("courses only 2")).setValue("80142");
			((PDTextField) acroForm.getField("Course Name 2")).setValue("Distributed Computing");
			((PDTextField) acroForm.getField("1MC_2")).setValue("David Gillman");
			((PDCheckBox) acroForm.getField("Session M1 2")).check();

			((PDTextField) acroForm.getField("courses only 3")).setValue("80142");
			((PDTextField) acroForm.getField("Course Name 3")).setValue("Distributed Computing");
			((PDTextField) acroForm.getField("1MC_3")).setValue("David Gillman");
			((PDCheckBox) acroForm.getField("Session M2 3")).check();

			((PDTextField) acroForm.getField("courses only 4")).setValue("80142");
			((PDTextField) acroForm.getField("Course Name 4")).setValue("Distributed Computing");
			((PDTextField) acroForm.getField("1MC_4")).setValue("David Gillman");
			((PDCheckBox) acroForm.getField("Session 1MC 4")).check();

			((PDTextField) acroForm.getField("courses only 5")).setValue("80142");
			((PDTextField) acroForm.getField("Course Name 5")).setValue("Distributed Computing");
			((PDTextField) acroForm.getField("1MC_5")).setValue("David Gillman");
			((PDCheckBox) acroForm.getField("5")).check();
			((PDCheckBox) acroForm.getField("Session A 5")).check();

			((PDTextField) acroForm.getField("Advisor")).setValue("David Gillman");

		}

		// Save and close the filled out form.
		pdfDocument.save("target/FillFormFieldOld.pdf");
		pdfDocument.close();
		System.out.println("Done!");
	}

	private static void buildPDF(OutputStream outputStream, InputStream formTemplateStream, ContractData contractData)
			throws IOException {
		//long startTime = System.nanoTime();
		
		PDDocument pdfDocument = PDDocument.load(formTemplateStream);

		//System.out.printf("pdf loaded; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);
		
		// get the document catalog
		PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();

		if (acroForm == null) {
			throw new IllegalArgumentException("Input PDF has no form to fill");
		}
		
		//System.out.printf("Ready to build form; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);
		
		PDFCreator creator = new PDFCreator(acroForm);
		creator.fill(contractData);
		
		
		//System.out.printf("Form created; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);
		
		pdfDocument.save(outputStream);
		pdfDocument.close();
		
		//System.out.printf("Form saved; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);
		
		System.out.println("Done!");
	}
	
	public static void buildPDF(OutputStream outputStream, ContractData contractData) throws IOException {
		buildPDF(outputStream, PDFCreator.class.getResourceAsStream("/Contract.pdf"), contractData);
	}

	public static void buildPDFToDisk(ContractData contractData) throws IOException {
		buildPDF(new FileOutputStream("target/FillFormField.pdf"),
				PDFCreator.class.getResourceAsStream("/Contract.pdf"), contractData);
	}
	
	public static byte[] buildPDFToBlob(ContractData contractData) throws IOException {
		ByteArrayOutputStream os = new ByteArrayOutputStream(300*1024);
		buildPDF(os, contractData);
		return os.toByteArray();
	}

	private final PDAcroForm acroForm;

	private PDFCreator(PDAcroForm acroForm) {
		this.acroForm = acroForm;
	}

	private void fill(ContractData contractData) throws IOException {
		ClassData[] classes = contractData.classes;
		if (classes == null) {
			classes = new ClassData[] {};
		}
		if (classes.length > 9) {
			throw new IllegalArgumentException("More classes than room on sheet");
		}
		if (contractData.semester != null && contractData.year != null) {
			setTextField(contractData.semester.fieldName, (String) contractData.year);
		}
		setTextField("Name", contractData.lastName);
		setTextField("First", contractData.firstName);
		setTextField("N", contractData.nNumber);
		setTextField("Expected Year of Graduation", contractData.expectedGradYear);
		setTextField("Box No", contractData.boxNumber);
		setTextField("GOALS Specify Short and Long Term", contractData.goals);
		setTextField("CERTIFICATION CRITERIA required minimum workload of 3 units", contractData.certificationCriteria);
		setTextField("DESCRIPTIONS AND OTHER ACTIVITIES", contractData.descriptionsOtherActivities);
		for (int i = 0; i < classes.length; i++) {
			fillClass(i + 1, classes[i]);
		}
	}

	private void fillClass(int classNumber, ClassData classData) throws IOException {
		setTextField("courses only " + classNumber, classData.courseCode);
		
		setTextField("Course Name " + classNumber, classData.courseName);
		
		// The instructor name field is weird, it goes 1MC, 1MC_2, 1MC_3, 1MC_4, etc.
		String oneMCExtra = (classNumber == 1 ? "" : "_" + classNumber);
		setTextField("1MC" + oneMCExtra, classData.instructorName);
		
		setCheckBox("Session " + classData.session.fieldName + " " + classNumber, true);

		// The internship check boxes are really weird; the first one is called "Check Box2", and then it goes 2, 3, ...
		String checkBoxField = classNumber == 1 ? "Check Box2" : String.valueOf(classNumber);
		setCheckBox(checkBoxField, classData.isInternship);
	}

	private void setTextField(String fieldName, String value) throws IOException {
		if (value != null) {
			PDField field = acroForm.getField(fieldName);
			if (!(field instanceof PDTextField)) {
				throw new IllegalArgumentException("Field is not a text field: " + fieldName + ", " + field);
			}
			((PDTextField) field).setValue(value);
		}
	}

	private void setCheckBox(String fieldName, Boolean value) throws IOException {
		if (value == null) {
			return;
		}
		PDField field = acroForm.getField(fieldName);
		if (!(field instanceof PDCheckBox)) {
			throw new IllegalArgumentException("Field is not a check box: " + fieldName + ", " + field);
		}
		if (value) {
			((PDCheckBox) field).check();
		}
		assert((PDCheckBox) field).isChecked() == value;
	}
}

enum Semester {
	FALL("Fall"), SPRING("Spring");
	public final String fieldName;

	Semester(String fieldName) {
		this.fieldName = fieldName;
	}
}

class ContractData {
	public Semester semester;
	public String year;
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

class ClassData {
	public String courseCode;
	public String courseName;
	public Boolean isInternship;
	public String instructorName;
	public Session session;

	public ClassData() {}

	public ClassData(String courseCode, String courseName, Boolean isInternship, Session session,
			String instructorName) {
		super();
		this.courseCode = courseCode;
		this.courseName = courseName;
		this.isInternship = isInternship;
		this.instructorName = instructorName;
		this.session = session;
	}
}