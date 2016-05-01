package edu.ncf.contractform;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.spec.QuerySpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.*;
import com.amazonaws.services.dynamodbv2.util.Tables;
import com.google.common.collect.ImmutableMap;

public enum DynamoDBContractStore {
	INSTANCE;
	private final AmazonDynamoDBClient dynamoDB;
	private final String tableName;
	private final SecureRandom random; // Used to generate contract IDs

	private DynamoDBContractStore() {
		this.dynamoDB = new AmazonDynamoDBClient(getCredentials());
		dynamoDB.setRegion(Region.getRegion(Regions.US_EAST_1));
		this.tableName = "Contracts";
		try {
			dynamoDB.describeTable(tableName); // Throws ResourceNotFoundException if does not exist
		} catch (ResourceNotFoundException e) {
			throw new RuntimeException("Could not find table " + tableName + ", does it exist?", e);
		}
		this.random = new SecureRandom();
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

	public static void main(String... args) {
		System.out.println("Table Description: " + INSTANCE.describeTable());
	}

	private TableDescription describeTable() {
		// Describe our new table
		DescribeTableRequest describeTableRequest = new DescribeTableRequest().withTableName(tableName);
		TableDescription tableDescription = dynamoDB.describeTable(describeTableRequest).getTable();
		return tableDescription;
	}

	private PutItemResult insertContract(String tableName, ContractEntry entry) {
		Map<String, AttributeValue> item = newItem2(entry);
		PutItemRequest putItemRequest = new PutItemRequest(tableName, item);
		PutItemResult putItemResult = dynamoDB.putItem(putItemRequest);
		return putItemResult;
	}

	private Map<String, AttributeValue> newItem(ContractEntry entry) {
		Map<String, AttributeValue> item = new HashMap<String, AttributeValue>();
		item.put("ContractId", new AttributeValue().withN(Long.toString(entry.contractId)));
		item.put("GoogleId", new AttributeValue(entry.googleId));
		item.put("ContractData", new AttributeValue(entry.contractData.toJson()));
		item.put("DateLastModified", new AttributeValue().withN(Long.toString(entry.dateLastModified)));
		return item;
	}

	private Map<String, AttributeValue> newItem2(ContractEntry entry) {
		return ImmutableMap.<String, AttributeValue> builder()
				.put("ContractId", new AttributeValue().withN(Long.toString(entry.contractId)))
				.put("GoogleId", new AttributeValue(entry.googleId))
				.put("GoogleId", new AttributeValue(entry.contractData.toJson()))
				.put("DateLastModified", new AttributeValue().withN(Long.toString(entry.dateLastModified)))
				.build();
	}
	
	private Map<String, AttributeValue> newItem3(ContractEntry entry) {
		return ImmutableMap.<String, AttributeValue> builder()
				.put("ContractId", new AttributeValue().withN(Long.toString(entry.contractId)))
				.put("GoogleId", new AttributeValue(entry.googleId))
				.put("GoogleId", new AttributeValue(entry.contractData.toJson()))
				.put("DateLastModified", new AttributeValue().withN(Long.toString(entry.dateLastModified)))
				.build();
	}

	public long createContract(String googleId) {
		/*
		 * This should never conflict with an existing contract ID, but we use a check down below just in case. Here is
		 * the math to justify that we should never get the same ID twice:
		 * Assume that the school has less than 1000 students at any given time, and that each year a given student
		 * creates, on average, no more than 10 contracts, and that our system is used for less than 100 years. Then the
		 * system should never contain more than 1000*10*100 = 1 million contracts. Our contract IDs are random numbers
		 * from throughout the range of Long (as guaranteed by the SecureRandom API), so there are 2^64 possible
		 * ContractID's. According to the birthday problem calculator at
		 * https://lazycackle.com/Probability_of_repeated_event_online_calculator__birthday_problem_.html,
		 * The probability of getting the same ID twice is ~2.7e-8, or 27 out of a billion, which we consider
		 * effectively impossible.
		 */
		long newContractId = random.nextLong();
		ContractEntry entry = new ContractEntry(newContractId, googleId, new ContractData(),
				System.currentTimeMillis());
		Map<String, AttributeValue> item = newItem2(entry);
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
		} catch (ProvisionedThroughputExceededException e) {
			// What do we do if the throughput is beyond capacity?
			throw e;
		}
		return newContractId;
	}
}
