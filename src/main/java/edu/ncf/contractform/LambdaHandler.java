package edu.ncf.contractform;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;

import com.amazonaws.services.lambda.runtime.Context; 
//import com.amazonaws.services.lambda.runtime.LambdaLogger;
//import com.google.gson.Gson;
import org.apache.commons.io.IOUtils;

public class LambdaHandler {
	private static boolean REQUIRE_GOOGLE = false;
	public void handler(InputStream inputStream, OutputStream outputStream, Context context) {
		try {
			String contractRequestJson = IOUtils.toString(inputStream, "UTF-8");
			RenderContractRequest.renderContractPDF(contractRequestJson, outputStream, REQUIRE_GOOGLE);
		} catch (IOException e) {
			context.getLogger().log(Arrays.toString(e.getStackTrace()));
			throw new RuntimeException(e);
		}
		
	}
}
