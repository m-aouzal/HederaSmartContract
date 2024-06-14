console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  AccountAllowanceApproveTransaction,
  Hbar,
} = require("@hashgraph/sdk");

async function main() {
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT_PRIVATE_KEY
  );
  const account1Id = AccountId.fromString(process.env.ACCOUNT1_ID);
  const account1Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT1_PRIVATE_KEY
  );
  const account2Id = AccountId.fromString(process.env.ACCOUNT2_ID);
  const account2Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT2_PRIVATE_KEY
  );
  const account3Id = AccountId.fromString(process.env.ACCOUNT3_ID);
  const account3Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT3_PRIVATE_KEY
  );
  const contractId = process.env.REWARD_DISTRIBUTION_CONTRACT_ID;
  const mstTokenAddress = process.env.MST_TOKEN_ADDRESS;
  const mptTokenAddress = process.env.MPT_TOKEN_ADDRESS;

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const client1 = Client.forTestnet().setOperator(account1Id, account1Key);
  const client2 = Client.forTestnet().setOperator(account2Id, account2Key);
  const client3 = Client.forTestnet().setOperator(account3Id, account3Key);

  try {
    // Approve MST token allowance for Operator
    console.log("Approving MST token allowance for Operator...");
    await approveTokenAllowance(
      client,
      operatorId,
      operatorKey,
      mstTokenAddress,
      contractId,
      1000000
    );

    // Approve MPT token allowance for Operator
    console.log("Approving MPT token allowance for Operator...");
    await approveTokenAllowance(
      client,
      operatorId,
      operatorKey,
      mptTokenAddress,
      contractId,
      1000000
    );

    // Approve MST token allowance for Account 1
    console.log("Approving MST token allowance for Account 1...");
    await approveTokenAllowance(
      client1,
      account1Id,
      account1Key,
      mstTokenAddress,
      contractId,
      1000000
    );

    // Approve MPT token allowance for Account 1
    console.log("Approving MPT token allowance for Account 1...");
    await approveTokenAllowance(
      client1,
      account1Id,
      account1Key,
      mptTokenAddress,
      contractId,
      1000000
    );

    // Approve MST token allowance for Account 2
    console.log("Approving MST token allowance for Account 2...");
    await approveTokenAllowance(
      client2,
      account2Id,
      account2Key,
      mstTokenAddress,
      contractId,
      1000000
    );

    // Approve MPT token allowance for Account 2
    console.log("Approving MPT token allowance for Account 2...");
    await approveTokenAllowance(
      client2,
      account2Id,
      account2Key,
      mptTokenAddress,
      contractId,
      1000000
    );

    // Approve MST token allowance for Account 3
    console.log("Approving MST token allowance for Account 3...");
    await approveTokenAllowance(
      client3,
      account3Id,
      account3Key,
      mstTokenAddress,
      contractId,
      1000000
    );

    // Approve MPT token allowance for Account 3
    console.log("Approving MPT token allowance for Account 3...");
    await approveTokenAllowance(
      client3,
      account3Id,
      account3Key,
      mptTokenAddress,
      contractId,
      1000000
    );

    console.log("Token allowances approved for all accounts.");
  } catch (error) {
    console.error("Error during token allowance approval:", error);
  }
}

async function approveTokenAllowance(
  client,
  accountId,
  privateKey,
  tokenAddress,
  contractId,
  allowanceAmount
) {
  const transaction = new AccountAllowanceApproveTransaction()
    .approveTokenAllowance(tokenAddress, accountId, contractId, allowanceAmount)
    .freezeWith(client);

  // Sign the transaction with the account key
  const signTx = await transaction.sign(privateKey);

  // Submit the transaction to a Hedera network
  const txResponse = await signTx.execute(client);

  // Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  // Get the transaction consensus status
  const transactionStatus = receipt.status;

  console.log(
    `Approved token allowance for ${tokenAddress} on account ${accountId}: ${transactionStatus.toString()}`
  );
}

main().catch(console.error);
