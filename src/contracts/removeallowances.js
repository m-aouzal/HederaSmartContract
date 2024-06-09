require("dotenv").config();
const {
  Client,
  AccountId,
  PrivateKey,
  AccountAllowanceApproveTransaction,
} = require("@hashgraph/sdk");

const contractIds = [
  "0.0.43822360",
  "0.0.43896650",
  "0.0.43897070",
  "0.0.43900510",
  "0.0.43900530",
  "0.0.43900570",
  "0.0.43900850",
  "0.0.43901226",
];

const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.ACCOUNT_PRIVATE_KEY);
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

const client = Client.forTestnet().setOperator(operatorId, operatorKey);
const client1 = Client.forTestnet().setOperator(account1Id, account1Key);
const client2 = Client.forTestnet().setOperator(account2Id, account2Key);
const client3 = Client.forTestnet().setOperator(account3Id, account3Key);

async function removeAllowance(
  tokenAddress,
  ownerId,
  ownerKey,
  spenderId,
  client
) {
  try {
    const transaction = new AccountAllowanceApproveTransaction()
      .approveTokenAllowance(tokenAddress, ownerId, spenderId, 0)
      .freezeWith(client);

    const signedTransaction = await transaction.sign(ownerKey);
    const response = await signedTransaction.execute(client);
    const receipt = await response.getReceipt(client);
    console.log(
      `Allowance removed for contract ${spenderId} from ${ownerId}: ${receipt.status.toString()}`
    );
  } catch (error) {
    console.error(
      `Error removing allowance for contract ${spenderId} from ${ownerId}:`,
      error
    );
  }
}

async function main() {
  try {
    console.log("Removing allowances...");

    for (const contractId of contractIds) {
      await removeAllowance(
        process.env.MST_TOKEN_ADDRESS,
        operatorId,
        operatorKey,
        contractId,
        client
      );
      await removeAllowance(
        process.env.MST_TOKEN_ADDRESS,
        account1Id,
        account1Key,
        contractId,
        client1
      );
      await removeAllowance(
        process.env.MST_TOKEN_ADDRESS,
        account2Id,
        account2Key,
        contractId,
        client2
      );
      await removeAllowance(
        process.env.MST_TOKEN_ADDRESS,
        account3Id,
        account3Key,
        contractId,
        client3
      );

      await removeAllowance(
        process.env.MPT_TOKEN_ADDRESS,
        operatorId,
        operatorKey,
        contractId,
        client
      );
      await removeAllowance(
        process.env.MPT_TOKEN_ADDRESS,
        account1Id,
        account1Key,
        contractId,
        client1
      );
      await removeAllowance(
        process.env.MPT_TOKEN_ADDRESS,
        account2Id,
        account2Key,
        contractId,
        client2
      );
      await removeAllowance(
        process.env.MPT_TOKEN_ADDRESS,
        account3Id,
        account3Key,
        contractId,
        client3
      );
    }

    console.log("Allowances removed successfully.");
  } catch (error) {
    console.error("Error during contract interaction:", error);
  }
}

main().catch(console.error);
