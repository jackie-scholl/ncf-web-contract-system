package edu.ncf.contractform.datastorage;

import java.util.*;
import java.util.stream.Collectors;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.model.*;
import com.google.common.collect.ImmutableMap;

public class DynamoDBContractStore2 implements ContractStore4 {
	private final AmazonDynamoDBClient dynamoDB;
	private final String tableName;

	private DynamoDBContractStore2(AWSCredentials credentials, Region region, String tableName,
			Optional<String> endpoint) {
		this.dynamoDB = new AmazonDynamoDBClient(getCredentials()).withRegion(region);
		endpoint.ifPresent(dynamoDB::setEndpoint);
		this.tableName = tableName;
		/*try {
			dynamoDB.describeTable(tableName); // Throws ResourceNotFoundException if does not exist
		} catch (ResourceNotFoundException e) {
			throw new RuntimeException("Could not find table " + tableName + ", does it exist?", e);
		}*/
	}

	private DynamoDBContractStore2() {
		this(getCredentials(), Region.getRegion(Regions.US_EAST_1), "Contracts2", Optional.empty());
	}
	
	private DynamoDBContractStore2(AWSCredentials credentials, Optional<String> endpoint) {
		this(credentials, Region.getRegion(Regions.US_EAST_1), "Contracts2", endpoint);
	}
	
	public static DynamoDBContractStore2 mainTable() {
		DynamoDBContractStore2 store = new DynamoDBContractStore2(getCredentials(), Optional.empty());
		if (!store.tableExists()) {
			store.createTable();
		}
		return store;
	}

	public static DynamoDBContractStore2 localTesting() {
		DynamoDBContractStore2 store = new DynamoDBContractStore2(null, Region.getRegion(Regions.US_EAST_1), "Contracts2",
				Optional.of("http://localhost:8000"));
		store.dynamoDB.deleteTable("Contracts2");
		store.createTable();
		return store;
	}

	/**
	 * Gets the AWS credentials to access the DynamoDB table "Contracts," which is owned by the "NCF Contracts" account.
	 * Looks in the .aws/credentials file in your home directory.
	 * 
	 * @return proper AWS credentials with the privileges to manipulate the "Contracts" table
	 */
	private static AWSCredentials getCredentials() {
		return new ProfileCredentialsProvider("ContractTableManager").getCredentials();
	}

	public static void main(String[] args) {
		DynamoDBContractStore2 store = localTesting();
		store.dynamoDB.deleteTable("Contracts2");
		store.createTable();
		ContractManager manager = new ContractManager(store);
		manager.importEntries();
		System.out.println(manager.getAllContracts());
		System.out.println(manager.getContractsByOwner("105457190982729373873"));
		System.out.println(manager.getContractById("105457190982729373873", "AAAAAAAAAAw="));
	}
	
	private boolean tableExists() {
		return dynamoDB.listTables().getTableNames().contains(tableName);
	}

	private void createTable() {
		createTable(tableName, 10, 10, "GoogleId", "S", "ContractId", "S");
	}

	private void createTable(String tableName, long readCapacityUnits, long writeCapacityUnits, String partitionKeyName,
			String partitionKeyType, String sortKeyName, String sortKeyType) {
		ArrayList<KeySchemaElement> keySchema = new ArrayList<KeySchemaElement>();
		keySchema.add(new KeySchemaElement()
				.withAttributeName(partitionKeyName)
				.withKeyType(KeyType.HASH)); // Partition key

		ArrayList<AttributeDefinition> attributeDefinitions = new ArrayList<AttributeDefinition>();
		attributeDefinitions.add(new AttributeDefinition()
				.withAttributeName(partitionKeyName)
				.withAttributeType(partitionKeyType));

		keySchema.add(new KeySchemaElement()
				.withAttributeName(sortKeyName)
				.withKeyType(KeyType.RANGE)); // Sort key
		attributeDefinitions.add(new AttributeDefinition()
				.withAttributeName(sortKeyName)
				.withAttributeType(sortKeyType));

		CreateTableRequest request = new CreateTableRequest()
				.withTableName(tableName)
				.withKeySchema(keySchema)
				.withProvisionedThroughput(new ProvisionedThroughput()
						.withReadCapacityUnits(readCapacityUnits)
						.withWriteCapacityUnits(writeCapacityUnits));

		request.setAttributeDefinitions(attributeDefinitions);

		System.out.println("Issuing CreateTable request for " + tableName);
		CreateTableResult result = dynamoDB.createTable(request);
		//System.out.println(result.getTableDescription());
	}

	public Optional<ContractEntry4> getContractById(String googleId, String contractId) {
		GetItemResult result = dynamoDB.getItem(
				new GetItemRequest()
						.withTableName(tableName)
						.addKeyEntry("GoogleId", new AttributeValue(googleId))
						.addKeyEntry("ContractId", new AttributeValue(contractId))
						.withConsistentRead(true));
		ContractEntry4 entry = attributeMapToContractEntry4(result.getItem());
		return Optional.of(entry).filter(e -> e.googleId.equals(googleId));
	}

	public Collection<ContractEntry4> getContractsByOwner(String googleId) {
		QueryRequest req = new QueryRequest(tableName)
				.withKeyConditionExpression("GoogleId = :google_id")
				.addExpressionAttributeValuesEntry(":google_id", new AttributeValue(googleId));
		return queryResultToContractEntries4(dynamoDB.query(req));
	}

	public Collection<ContractEntry4> getAllContracts() {
		ScanRequest scanRequest = new ScanRequest(tableName);
		ScanResult scanResult = dynamoDB.scan(scanRequest);
		System.out.println("Scan result: " + scanResult);
		return attributeMapsToContractEntries4(scanResult.getItems());
	}

	public void createContract(ContractEntry4 entry) {
		Map<String, AttributeValue> item = contractEntry4ToAttributeMap(entry);
		/*
		 * From the DynamoDB docs:
		 * "To prevent a new item from replacing an existing item, use a conditional expression that contains the
		 *  attribute_not_exists function with the name of the attribute being used as the partition key for the table.
		 *  Since every record must contain that attribute, the attribute_not_exists function will only succeed if no
		 *  matching item exists."
		 * If we get a conditionalCheckFailedException, then our conditional expression, 
		 * 'attribute_not_exists(ContractId)', must have failed. This means we tried to insert a new item with the same
		 * ContractId as an existing item. This represents a catastrophic failure. Either there are way too many items
		 * in the database, or our randomization is broken, or our code is broken. 
		 */
		PutItemRequest putItemRequest = new PutItemRequest(tableName, item)
				.withConditionExpression("attribute_not_exists(ContractId)");
		try {
			dynamoDB.putItem(putItemRequest);
		} catch (ConditionalCheckFailedException e) {
			throw new RuntimeException(
					"Tried to create new item, but ContractId already exists; this is terrible. See comments.", e);
		}
	}

	public void updateContract(ContractEntry4 entry) {
		UpdateItemRequest updateItemRequest = new UpdateItemRequest()
				.withTableName(tableName)
				.addKeyEntry("ContractId", new AttributeValue(entry.contractId))
				.withConditionExpression("GoogleId = :google_id")
				.addExpressionAttributeValuesEntry(":google_id", new AttributeValue(entry.googleId))
				.withUpdateExpression("SET Blob = :contract_blob")
				.addExpressionAttributeValuesEntry(":contract_blob", new AttributeValue(entry.blob))
				.withReturnValues(ReturnValue.ALL_NEW);
		UpdateItemResult updateResult = dynamoDB.updateItem(updateItemRequest);
		ContractEntry4 updatedEntry = attributeMapToContractEntry4(updateResult.getAttributes());
	}

	private Map<String, AttributeValue> contractEntry4ToAttributeMap(ContractEntry4 entry) {
		return ImmutableMap.<String, AttributeValue> builder()
				.put("GoogleId", new AttributeValue(entry.googleId))
				.put("ContractId", new AttributeValue(entry.contractId))
				.put("Blob", new AttributeValue(entry.blob))
				.build();
	}

	private static List<ContractEntry4> queryResultToContractEntries4(QueryResult queryResult) {
		return queryResult.getItems().stream().map(DynamoDBContractStore2::attributeMapToContractEntry4)
				.collect(Collectors.toList());
	}

	private static List<ContractEntry4> attributeMapsToContractEntries4(List<Map<String, AttributeValue>> mapList) {
		return mapList.stream().map(DynamoDBContractStore2::attributeMapToContractEntry4)
				.collect(Collectors.toList());
	}

	private static ContractEntry4 attributeMapToContractEntry4(Map<String, AttributeValue> map) {
		// System.out.println(map);
		return new ContractEntry4(
				map.get("GoogleId").getS(),
				map.get("ContractId").getS(),
				map.get("Blob").getS());
	}

}
