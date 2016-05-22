package edu.ncf.contractform.datastorage;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.google.common.primitives.Longs;

import edu.ncf.contractform.ContractData;

public class ContractStringStoreAdapter implements ContractStore {
	private final SecureRandom random = new SecureRandom(); // Used to generate contract IDs
	private final ContractStringStore base;
	
	public ContractStringStoreAdapter(ContractStringStore contractStringStore) {
		this.base = contractStringStore;
	}
	
	public Optional<ContractEntry> getContract(String contractId, String googleId) {
		return base.getContractById(contractId, googleId).map(ContractStringEntry::toContractEntry);
	}
	
	public List<ContractEntry> getContractsByGoogleId(String googleId) {
		return base.getContractsByOwner(googleId).stream().map(ContractStringEntry::toContractEntry).collect(Collectors.toList());
	}
	
	public List<ContractEntry> getAllContracts() {
		return base.getAllContracts().stream().map(ContractStringEntry::toContractEntry).collect(Collectors.toList());
	}
	
	public String createContract(String googleId, ContractData initialData) {
		String newContractId = Base64.getUrlEncoder().encodeToString(Longs.toByteArray(random.nextLong()));
		String contractDataString = initialData.toJson();
		long dateLastModified = System.currentTimeMillis();
		base.createContract(new ContractStringEntry(newContractId, googleId, contractDataString, dateLastModified));
		return newContractId;
	}
	
	public void updateContract(String contractId, String googleId, ContractData newContents) {
		base.updateContract(new ContractStringEntry(
				contractId, 
				googleId,
				newContents.toJson(),
				System.currentTimeMillis()));
	}

}

interface ContractStringStore {
	Optional<ContractStringEntry> getContractById(String contractId, String googleId);
	Collection<ContractStringEntry> getContractsByOwner(String googleId);
	Collection<ContractStringEntry> getAllContracts();
	void createContract(ContractStringEntry entry);
	void updateContract(ContractStringEntry entry);
}

class ContractStringEntry {
	public String contractId;
	public String googleId;
	public String contract;
	public long dateLastModified;
	public ContractStringEntry(String contractId, String googleId, String contract, long dateLastModified) {
		this.contractId = contractId;
		this.googleId = googleId;
		this.contract = contract;
		this.dateLastModified = dateLastModified;
	}
	public ContractEntry toContractEntry() {
		return new ContractEntry(contractId, googleId, ContractData.fromJson(contract), dateLastModified);
	}
}