package edu.ncf.contractform;

import java.util.List;

public interface ContractStore {
	public ContractEntry getContractByContractID(long contractID);
	public List<ContractEntry> getContractsByGoogleID(String googleID);
	public long createContract(String googleID);
	public void updateContract(long contractID, ContractData newContents);
	public void showContracts();
}
