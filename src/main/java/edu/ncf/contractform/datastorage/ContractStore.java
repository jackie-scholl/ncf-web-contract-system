package edu.ncf.contractform.datastorage;

import java.util.List;
import java.util.Optional;

import edu.ncf.contractform.ContractData;

public interface ContractStore {
	public Optional<ContractEntry> getContract(String contractId, String googleId);
	public List<ContractEntry> getContractsByGoogleId(String googleID);
	public String createContract(String googleID, ContractData initialData);
	public void updateContract(String contractID, String googleId, ContractData newContents);
	public List<ContractEntry> getAllContracts();
	
	public static final ContractStore LOCAL_SQLITE = SQLiteContractManager.getDefault()
									;// ,DYNAMO_DB = DynamoDBContractStore.instance();
	
	static final ContractStore DEFAULT = LOCAL_SQLITE;
	public static ContractStore getDefaultContractStore() {
		//return DynamoDBContractStore.instance();
		return DEFAULT;
	}
}
