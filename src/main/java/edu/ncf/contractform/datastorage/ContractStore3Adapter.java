package edu.ncf.contractform.datastorage;

import java.util.*;
import java.util.stream.Collectors;

import com.google.gson.Gson;

public class ContractStore3Adapter implements ContractStringStore {
	private final ContractStore3 base;
	
	public ContractStore3Adapter(ContractStore3 contractStore3) {
		this.base = contractStore3;
	}

	public Optional<ContractStringEntry> getContractById(String contractId, String googleId) {
		return base.getContractById(contractId, googleId).map(ContractEntry3::toContractStringEntry);
	}

	public Collection<ContractStringEntry> getContractsByOwner(String googleId) {
		return base.getContractsByOwner(googleId).stream().map(ContractEntry3::toContractStringEntry).collect(Collectors.toList());
	}

	public Collection<ContractStringEntry> getAllContracts() {
		return base.getAllContracts().stream().map(ContractEntry3::toContractStringEntry).collect(Collectors.toList());
	}

	public void createContract(ContractStringEntry entry) {
		base.createContract(ContractEntry3.fromContractStringEntry(entry));
	}

	public void updateContract(ContractStringEntry entry) {
		base.updateContract(ContractEntry3.fromContractStringEntry(entry));
	}
	
}


interface ContractStore3 {
	Optional<ContractEntry3> getContractById(String contractId, String googleId);
	Collection<ContractEntry3> getContractsByOwner(String googleId);
	Collection<ContractEntry3> getAllContracts();
	void createContract(ContractEntry3 entry);
	void updateContract(ContractEntry3 entry);
}

class ContractEntry3 {
	public String contractId;
	public String googleId;
	public String data;
	public ContractEntry3(String contractId, String googleId, String data) {
		this.contractId = contractId;
		this.googleId = googleId;
		this.data = data;
	}
	
	public ContractStringEntry toContractStringEntry() {
		ContractDataDateLastModified tuple = ContractDataDateLastModified.fromString(data);
		return new ContractStringEntry(contractId, googleId, tuple.getContractData(), tuple.getDateLastModified());
	}
	
	static ContractEntry3 fromContractStringEntry(ContractStringEntry entry) {
		String data = new ContractDataDateLastModified(entry.contract, entry.dateLastModified).toString();
		return new ContractEntry3(entry.contractId, entry.googleId, data);
	}
	
	private static class ContractDataDateLastModified {
		private String contractData;
		private long dateLastModified;
		private final static Gson gson = new Gson();
		public ContractDataDateLastModified(String contractData, long dateLastModified) {
			this.contractData = contractData;
			this.dateLastModified = dateLastModified;
		}
		public static ContractDataDateLastModified fromString(String data) {
			return gson.fromJson(data,ContractDataDateLastModified.class);
		}
		public String toString() {
			return gson.toJson(this);
		}
		public String getContractData() {
			return contractData;
		}
		public long getDateLastModified() {
			return dateLastModified;
		}	
	}
}