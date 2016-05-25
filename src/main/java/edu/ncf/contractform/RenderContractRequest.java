package edu.ncf.contractform;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;

public class RenderContractRequest {
	public ContractData contractData;
	public Map<String, String> authentication; // follows same format as Cognito Identity Pool
	public Map<String, Object> options;

	public String toJson() {
		return new Gson().toJson(this);
	}

	public static RenderContractRequest fromJson(String json) {
		return new Gson().fromJson(json, RenderContractRequest.class);
	}

	public RenderContractRequest normalize() {
		if (contractData == null) {
			throw new IllegalArgumentException(this.toJson());
		}
		if (authentication == null) {
			authentication = new HashMap<>();
		}
		if (options == null) {
			options = new HashMap<>();
		}
		return this; // for chaining
	}

	public RenderContractRequest checkAuthentication(boolean requireGoogle) {
		if (requireGoogle) {
			GooglePayload.fromIdTokenString(authentication.get("accounts.google.com"));
		} else {
			; // do nothing, allow anonymous
		}
		return this; // for chaining
	}

	public static void renderContractPDF(String renderRequestJSON, OutputStream outputStream, boolean requireGoogle)
			throws IOException {
		RenderContractRequest renderRequest = RenderContractRequest.fromJson(renderRequestJSON).normalize()
				.checkAuthentication(requireGoogle);
		renderContractPDFBase(renderRequest, outputStream);
	}

	private static void renderContractPDFBase(RenderContractRequest req, OutputStream outputStream) throws IOException {
		PDFCreator.buildPDF(outputStream, req.contractData, req.options);
	}
}
