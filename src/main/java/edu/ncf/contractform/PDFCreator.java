package edu.ncf.contractform;

import java.io.*;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.*;
import org.eclipse.jetty.io.EofException;

import com.google.common.collect.ImmutableSet;

public class PDFCreator {
	public static final boolean FLATTEN_PDF = true;
	
	public static void main(String[] args) throws IOException {
		buildPDFToDisk(buildSampleContract());
	}

	private static ContractData buildSampleContract() {
		ContractData data = new ContractData();
		data.semester = "Fall";
		data.contractYear = "2015";
		data.studyLocation = "On Campus";
		data.firstName = "Jackie";
		data.lastName = "Scholl";
		data.nNumber = "123456789";
		data.expectedGradYear = "2019";
		data.boxNumber = "862";
		data.goals = "Learn to fly, solve world hunger";
		data.certificationCriteria = "Three out of four units. (3/4)";
		data.descriptionsOtherActivities = "Look cool the whole time";
		data.advisorName = "David Gillman";

		data.classes = new ClassData[] {
				new ClassData("80141", "Computer Networks", false, Session.A, "Matthew Lepinski"),
				new ClassData("80142", "Distributed Computing", false, Session.M1, "David Gillman"),
				new ClassData("80142", "Distributed Computing", false, Session.M2, "David Gillman"),
				new ClassData("80142", "Distributed Computing", false, Session.ONE_MC, "David Gillman"),
				new ClassData("80142", "Distributed Computing", true, Session.A, "David Gillman"),
		};

		/*data.classes = new ClassData[] {
				new ClassData("12345", "Learning Stuff 101", false, Session.A, "Professor McSmarty Pants")
		};*/

		return data;
	}

	private static void buildPDF(OutputStream outputStream, InputStream formTemplateStream, ContractData contractData)
			throws IOException {
		// long startTime = System.nanoTime();

		PDDocument pdfDocument = PDDocument.load(formTemplateStream);

		// System.out.printf("pdf loaded; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		// get the document catalog
		PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();

		if (acroForm == null) {
			throw new IllegalArgumentException("Input PDF has no form to fill");
		}

		// System.out.printf("Ready to build form; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		PDFCreator creator = new PDFCreator(acroForm);
		creator.fill(contractData);

		if (FLATTEN_PDF) {
			Set<String> fieldsToRemove = ImmutableSet.of("Clear Form", "Print Form", "Save Form");
			List<PDField> fieldsToKeep = acroForm.getFields().stream()
					.filter(x -> !fieldsToRemove.contains(x.getFullyQualifiedName())).collect(Collectors.toList());
			acroForm.flatten(fieldsToKeep, true);
		}

		// System.out.printf("Form created; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		try {
			pdfDocument.save(outputStream);
		} catch (EofException e) {}

		pdfDocument.close();
		
		// System.out.printf("Form saved; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		System.out.println("Done!");
	}

	public static void buildPDF(OutputStream outputStream, ContractData contractData) throws IOException {
		buildPDF(new BufferedOutputStream(outputStream), PDFCreator.class.getResourceAsStream("/Contract.pdf"),
				contractData);
	}

	public static void buildPDFToDisk(ContractData contractData) throws IOException {
		buildPDF(new FileOutputStream("target/FillFormField.pdf"),
				PDFCreator.class.getResourceAsStream("/Contract.pdf"), contractData);
	}

	public static byte[] buildPDFToBlob(ContractData contractData) throws IOException {
		ByteArrayOutputStream os = new ByteArrayOutputStream(300 * 1024);
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
		if (contractData.semester != null && contractData.contractYear != null) {
			if (ContractData.LEGAL_SEMESTERS.contains(contractData.semester)) {
				setTextField(contractData.semester, (String) contractData.contractYear);
				setOtherFieldValue("Semester", (String) contractData.semester);
			} else {
				throw new IllegalArgumentException(
						"Semester must be one of the following: " + ContractData.LEGAL_SEMESTERS);
			}
		}
		setOtherFieldValue("On Campus/Off Campus", contractData.studyLocation);
		setTextField("Name", contractData.lastName);
		setTextField("First", contractData.firstName);
		setTextField("N", contractData.nNumber);
		setTextField("Expected Year of Graduation", contractData.expectedGradYear);
		setTextField("Box No", contractData.boxNumber);
		setTextField("GOALS Specify Short and Long Term", contractData.goals);
		setTextField("CERTIFICATION CRITERIA required minimum workload of 3 units", contractData.certificationCriteria);
		setTextField("DESCRIPTIONS AND OTHER ACTIVITIES", contractData.descriptionsOtherActivities);
		for (int i = 0; i < classes.length; i++) {
			if (classes[i] != null) {
				fillClass(i + 1, classes[i]);
			}
		}
	}

	private void fillClass(int classNumber, ClassData classData) throws IOException {
		setTextField("courses only " + classNumber, classData.courseCode);

		setTextField("Course Name " + classNumber, classData.courseName);

		// The instructor name field is weird, it goes 1MC, 1MC_2, 1MC_3, 1MC_4, etc.
		String oneMCExtra = (classNumber == 1 ? "" : "_" + classNumber);
		setTextField("1MC" + oneMCExtra, classData.instructorName);

		if (classData.sessionName != null) {
			if (ClassData.LEGAL_SESSIONS.contains(classData.sessionName)) {
				setCheckBox("Session " + classData.sessionName + " " + classNumber, true);
			} else {
				throw new IllegalArgumentException(
						"Session name must be one of the following: " + ClassData.LEGAL_SESSIONS);
			}
		}

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

	private void setOtherFieldValue(String fieldName, String value) throws IOException {
		if (value == null) {
			return;
		}
		PDField field = acroForm.getField(fieldName);
		/*if (!(field instanceof PDCheckBox)) {
			throw new IllegalArgumentException("Field is not a check box: " + fieldName + ", " + field);
		}*/
		field.setValue(value);
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