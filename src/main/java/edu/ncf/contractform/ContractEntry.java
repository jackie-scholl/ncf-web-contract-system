package edu.ncf.contractform;

import com.google.gson.Gson;

public class ContractEntry {
	public String contractId;
	public String googleId;
	public ContractData contractData;
	public long dateLastModified;
	
	public ContractEntry(String contractId, String googleId, ContractData contractData, long dateLastModified) {
		this.contractId = contractId;
		this.googleId = googleId;
		this.contractData = contractData;
		this.dateLastModified = dateLastModified;
	}

	public String toJson() {
		return new Gson().toJson(this);
	}
	
	public static ContractEntry fromJson(String json) {
		return new Gson().fromJson(json, ContractEntry.class);
	}
	
	public String toString() {
		return toJson();
	}
}