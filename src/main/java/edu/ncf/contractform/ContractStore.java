package edu.ncf.contractform;

import java.util.List;

public interface ContractStore {
	public ContractEntry getContractByContractId(String contractId);
	public List<ContractEntry> getContractsByGoogleId(String googleID);
	public String createContract(String googleID);
	public void updateContract(String contractID, String googleId, ContractData newContents);
	public void showContracts();
}
