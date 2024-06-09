console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  TokenAssociateTransaction,
} = require("@hashgraph/sdk");

async function associateTokenToAccount(client, accountId, accountKey, tokenId) {
  try {
    // Create the Token Associate transaction
    const transaction = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    // Sign the transaction with the private key of the account being associated
    const signTx = await transaction.sign(accountKey);

    // Submit the transaction to a Hedera network
    const txResponse = await signTx.execute(client);

    // Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    // Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(
      `The transaction asscociation status for ${accountId} is ${transactionStatus.toString()}`
    );
  } catch (error) {
    console.error(`Error associating token for ${accountId}:`, error);
  }
}

async function main() {
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT_PRIVATE_KEY
  );
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const mstTokenId = process.env.MST_TOKEN_ADDRESS;
  const mptTokenId = process.env.MPT_TOKEN_ADDRESS;
  const tokenId = process.env.TOKEN_ID;
  const account2Id = AccountId.fromString(process.env.ACCOUNT2_ID);
  const account2Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT2_PRIVATE_KEY
  );
  // const client2 = Client.forTestnet().setOperator(account2Id, account2Key);
  // await associateTokenToAccount(client2, account2Id, account2Key, mstTokenId);
  // await associateTokenToAccount(client2, account2Id, account2Key, mptTokenId);

  const account3Id = AccountId.fromString(process.env.ACCOUNT3_ID);
  const account3Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT3_PRIVATE_KEY
  );
  const client3 = Client.forTestnet().setOperator(account3Id, account3Key);
  await associateTokenToAccount(client3, account3Id, account3Key, mstTokenId);
  await associateTokenToAccount(client3, account3Id, account3Key, mptTokenId);

  const account1Id = AccountId.fromString(process.env.ACCOUNT1_ID);
  const account1Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT1_PRIVATE_KEY
  );
  const client1 = Client.forTestnet().setOperator(account1Id, account1Key);
  await associateTokenToAccount(client1, account1Id, account1Key, mstTokenId);
  await associateTokenToAccount(client1, account1Id, account1Key, mptTokenId);
}

main().catch(console.error);
