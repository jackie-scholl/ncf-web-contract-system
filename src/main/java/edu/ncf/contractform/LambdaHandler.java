package edu.ncf.contractform;

import java.io.InputStream;
import java.io.OutputStream;
import com.amazonaws.services.lambda.runtime.Context; 
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.google.gson.Gson;
import org.apache.commons.io.IOUtils;

public class LambdaHandler {
	public void handler(InputStream inputStream, OutputStream outputStream, Context context) {
		//String contractRequestJson = IOUtils.toString(inputStream, "UTF-8");
	}
}
