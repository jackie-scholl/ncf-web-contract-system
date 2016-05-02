package edu.ncf.contractform;

import java.util.List;

public interface ContractStore {
	public ContractEntry getContractByContractId(long contractId);
	public List<ContractEntry> getContractsByGoogleId(String googleID);
	public long createContract(String googleID);
	public void updateContract(long contractID, String googleId, ContractData newContents);
	public void showContracts();
}
