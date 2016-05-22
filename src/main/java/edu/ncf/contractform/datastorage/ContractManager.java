package edu.ncf.contractform.datastorage;

import java.security.SecureRandom;
import java.util.*;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class ContractManager {
	private static final int CONTRACT_ID_LENGTH_BYTES = 16;
	private final SecureRandom random = new SecureRandom(); // Used to generate contract IDs
	private final ContractStore4 base;
	
	public ContractManager(ContractStore4 base) {
		this.base = base;
	}
	
	public ContractEntry4 getContractById(String googleId, String contractId) {
		return base.getContractById(googleId, contractId).orElseThrow(() -> new ContractDoesNotExistException(googleId, contractId));
	}
	
	public Collection<ContractEntry4> getContractsByOwner(String googleId) {
		return base.getContractsByOwner(googleId);
	}
	
	public Collection<ContractEntry4> getAllContracts() {
		return base.getAllContracts();
	}
	
	public String createContract(String googleId, String initialData) {
		byte[] b = new byte[CONTRACT_ID_LENGTH_BYTES];
		random.nextBytes(b);
		String newContractId = Base64.getUrlEncoder().encodeToString(b);
		base.createContract(new ContractEntry4(googleId, newContractId, initialData));
		return newContractId;
	}
	
	public void updateContract(String googleId, String contractId, String newData) {
		base.updateContract(new ContractEntry4(googleId, contractId, newData));
	}
	
	class ContractDoesNotExistException extends RuntimeException {
		public ContractDoesNotExistException(String googleId, String contractId) {
			super(String.format("The contract with ID %s does not exist, or the user %s does not have access", contractId, googleId));
		}
	}
	
	void importEntries() {
		importEntries(ContractStore.DEFAULT.getAllContracts());
	}
	
	void importEntries(List<ContractEntry> contractEntries) {
		for (ContractEntry e : contractEntries) {
			String c1 = new Gson().toJson(e.contractData);
			java.lang.reflect.Type type = new TypeToken<Map<String, Object>>(){}.getType();
			Map<String, Object> map = new Gson().fromJson(c1, type);
			map.put("dateLastModified", e.dateLastModified);
			String c2 = new Gson().toJson(map);
			base.createContract(new ContractEntry4(e.googleId, e.contractId, c2));
		}
	}
}