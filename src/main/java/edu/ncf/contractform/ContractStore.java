package edu.ncf.contractform;

import java.util.List;
import java.util.Optional;

public interface ContractStore {
	@Deprecated public ContractEntry getContractByContractId(String contractId);
	public Optional<ContractEntry> getContract(String contractId, String googleId);
	public List<ContractEntry> getContractsByGoogleId(String googleID);
	public String createContract(String googleID, ContractData initialData);
	public void updateContract(String contractID, String googleId, ContractData newContents);
	public List<ContractEntry> getAllContracts();
	@Deprecated default	public void showContracts() {
		System.out.println(getAllContracts());
	};
	
	public static final ContractStore LOCAL_SQLITE = SQLiteContractManager.getDefault(),
									DYNAMO_DB = DynamoDBContractStore.instance();
	
	static final ContractStore DEFAULT = LOCAL_SQLITE;
	public static ContractStore getDefaultContractStore() {
		//return DynamoDBContractStore.instance();
		return DEFAULT;
	}
}
