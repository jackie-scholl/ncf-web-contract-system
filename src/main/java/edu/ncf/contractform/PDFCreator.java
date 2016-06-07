package edu.ncf.contractform;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDCheckBox;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;
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

		return data;
	}

	private static void buildPDF(OutputStream outputStream, InputStream formTemplateStream, ContractData contractData,
			Map<String, Object> options) throws IOException {
		long startTime = System.nanoTime();

		PDDocument pdfDocument = PDDocument.load(formTemplateStream);

		System.out.printf("pdf loaded; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		//get the document catalog
		PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();

		if (acroForm == null) {
			throw new IllegalArgumentException("Input PDF has no form to fill");
		}

		System.out.printf("Ready to build form; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		PDFCreator creator = new PDFCreator(acroForm);
		creator.fill(contractData);

		boolean flattenPDF = Optional.ofNullable((Boolean) options.get("flatten_pdf")).orElse(FLATTEN_PDF)
				.booleanValue();
		if (flattenPDF) {
			Set<String> fieldsToRemove = ImmutableSet.of("Clear Form", "Print Form", "Save Form");
			List<PDField> fieldsToKeep = acroForm.getFields().stream()
					.filter(x -> !fieldsToRemove.contains(x.getFullyQualifiedName())).collect(Collectors.toList());
			acroForm.flatten(fieldsToKeep, true);
		}

		System.out.printf("Form created; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		try {
			pdfDocument.save(outputStream);
		} catch (EofException e) {}

		pdfDocument.close();

		System.out.printf("Form saved; %f milliseconds%n", (System.nanoTime() - startTime) / 1.0e6);

		System.out.println("Done!");
	}

	private static void buildPDF(OutputStream outputStream, InputStream formTemplateStream, ContractData contractData)
			throws IOException {
		buildPDF(outputStream, formTemplateStream, contractData, new HashMap<>());
	}

	public static void buildPDF(OutputStream outputStream, ContractData contractData, Map<String, Object> options) throws IOException {
		buildPDF(new BufferedOutputStream(outputStream), PDFCreator.class.getResourceAsStream("/Contract.pdf"),
				contractData, options);
	}

	public static void buildPDFToDisk(ContractData contractData) throws IOException {
		buildPDF(new FileOutputStream("target/FillFormField.pdf"),
				PDFCreator.class.getResourceAsStream("/Contract.pdf"), contractData);
	}

	public static byte[] buildPDFToBlob(ContractData contractData, Map<String, Object> options) throws IOException {
		ByteArrayOutputStream os = new ByteArrayOutputStream(300 * 1024);
		buildPDF(os, contractData, options);
		return os.toByteArray();
	}

	private final PDAcroForm acroForm;

	private PDFCreator(PDAcroForm acroForm) {
		this.acroForm = acroForm;
	}

	private void fill(ContractData contractData) throws IOException {
		contractData.normalize(false);
		if (!contractData.semester.equals("")) {
			setOtherFieldValue("Semester", (String) contractData.semester);
			setTextField(contractData.semester, (String) contractData.contractYear);
		}
		if (!contractData.studyLocation.equals("")) {
			setOtherFieldValue("On Campus/Off Campus", contractData.studyLocation);
		}
		setTextField("Name", contractData.lastName);
		setTextField("First", contractData.firstName);
		setTextField("N", contractData.nNumber);
		setTextField("Expected Year of Graduation", contractData.expectedGradYear);
		setTextField("Box No", contractData.boxNumber);
		setTextField("GOALS Specify Short and Long Term", contractData.goals);
		setTextField("CERTIFICATION CRITERIA required minimum workload of 3 units", contractData.certificationCriteria);
		setTextField("DESCRIPTIONS AND OTHER ACTIVITIES", contractData.descriptionsOtherActivities);
		for (int i = 0; i < contractData.classes.length; i++) {
			fillClass(i + 1, contractData.classes[i]);
		}
	}

	private void fillClass(int classNumber, ClassData classData) throws IOException {
		if (classData == null) {
			return;
		}
		setTextField("courses only " + classNumber, classData.courseCode);

		setTextField("Course Name " + classNumber, classData.courseName);

		// The instructor name field is weird, it goes 1MC, 1MC_2, 1MC_3, 1MC_4, etc.
		String oneMCExtra = (classNumber == 1 ? "" : "_" + classNumber);
		setTextField("1MC" + oneMCExtra, classData.instructorName);

		if (!classData.sessionName.equals("")) {
			setCheckBox("Session " + classData.sessionName + " " + classNumber, true);
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