package edu.ncf.contractform.datastorage;

import java.util.Collection;
import java.util.Optional;

import com.google.gson.Gson;

public interface ContractStore4 {
	Optional<ContractEntry4> getContractById(String googleId, String contractId);
	Collection<ContractEntry4> getContractsByOwner(String googleId);
	Collection<ContractEntry4> getAllContracts();
	void createContract(ContractEntry4 entry);
	void updateContract(ContractEntry4 entry);
}

class ContractEntry4 {
	public String googleId;
	public String contractId;
	public String blob;
	public ContractEntry4(String googleId, String contractId, String blob) {
		this.googleId = googleId;
		this.contractId = contractId;
		this.blob = blob;
	}
	
	public String toString() {
		return String.format("{GoogleId: %s, ContractId: %s}", googleId, contractId);
		//return new Gson().toJson(this);
	}
}