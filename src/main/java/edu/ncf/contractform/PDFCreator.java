package edu.ncf.contractform;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDCheckBox;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;

public class PDFCreator {
	public static void main(String[] args) throws IOException {
		
		InputStream formTemplateStream = PDFCreator.class.getResourceAsStream("/Contract.pdf");
		
		System.out.println(formTemplateStream);

		// load the document
		//PDDocument pdfDocument = PDDocument.load(new File(formTemplate));
		PDDocument pdfDocument = PDDocument.load(formTemplateStream);

		// get the document catalog
		PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();

		// as there might not be an AcroForm entry a null check is necessary
		if (acroForm != null) {
			// Retrieve an individual field and set its value.
			for (PDField x : acroForm.getFields()) {
				System.out.println(x.getFullyQualifiedName());
			}
			
			System.out.println("\n\n\n");
			
			//System.out.println(acroForm.getFields());
			//PDTextField field = (PDTextField) acroForm.getField("Expected Year of Graduation");
			//field.setValue("Fuck You");
			

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
			((PDCheckBox) acroForm.getField("Session A 2")).check();

			
			((PDTextField) acroForm.getField("Advisor")).setValue("David Gillman");
			/*((PDTextField) acroForm.getField("Signature")).setValue("David Gillman");
			((PDTextField) acroForm.getField("Date")).setValue("8/22/2015");

			((PDTextField) acroForm.getField("Student Signature")).setValue("Jackie Scholl");
			((PDTextField) acroForm.getField("Date_2")).setValue("8/21/2015");*/
			
			
			
			
			
			//FDFDocument x = acroForm.exportFDF();
			//x.save("fdfdocument");
			// If a field is nested within the form tree a fully qualified name
			// might be provided to access the field.
			//field = (PDTextField) acroForm.getField("fieldsContainer.nestedSampleField");
			//field.setValue("Text Entry");
		}

		// Save and close the filled out form.
		pdfDocument.save("target/FillFormField.pdf");
		pdfDocument.close();
		System.out.println("Done!");
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
	public String advisorName;
}

enum Session {
	A, M1, M2, ONE_MC;
}

class Class {
	public String courseCode;
	public String courseName;
	public boolean isInternship;
	public String instructorName;
}