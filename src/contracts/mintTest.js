console.clear();
require("dotenv").config();
const {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  TokenUpdateTransaction,
  ContractExecuteTransaction,
  TokenInfoQuery,
  AccountBalanceQuery,
  Hbar,
  TokenMintTransaction,
} = require("@hashgraph/sdk");
const fs = require("fs");

async function main() {
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT_PRIVATE_KEY
  );
  const contractId = AccountId.fromString(
    process.env.REWARD_DISTRIBUTION_CONTRACT_ID
  );


  const client = Client.forTestnet()
    .setOperator(operatorId, operatorKey)
    .setDefaultMaxTransactionFee(new Hbar(20));

  const mptTokenId = process.env.MPT_TOKEN_ADDRESS; // Ensure this is the correct variable
  const mstTokenId = process.env.MST_TOKEN_ADDRESS; // Ensure this is the correct variable

   const tokenUpdateTxMST = await new TokenUpdateTransaction()
     .setTokenId(process.env.MPT_TOKEN_ADDRESS)
     .setSupplyKey(operatorKey)
     .freezeWith(client)
     .sign(operatorKey);
   const tokenUpdateSubmitMST = await tokenUpdateTxMST.execute(client);
   const tokenUpdateRxMST = await tokenUpdateSubmitMST.getReceipt(client);
   console.log(`- MST Token update status: ${tokenUpdateRxMST.status}`);
  try {
    var tokenInfo = await new TokenInfoQuery()
      .setTokenId(mptTokenId)
      .execute(client);
    console.log(`- Token supply key: ${tokenInfo.supplyKey.toString()}`);

    //Mint another 1,000 tokens and freeze the unsigned transaction for manual signing
    const transaction = await new TokenMintTransaction()
      .setTokenId(mptTokenId)
      .setAmount(1000000)
      .setMaxTransactionFee(new Hbar(20)) //Use when HBAR is under 10 cents
      .freezeWith(client);

    //Sign with the supply private key of the token
    const signTx = await transaction.sign(operatorKey);

    //Submit the transaction to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(
      "The transaction consensus status " + transactionStatus.toString()
    );
  } catch (error) {
    console.error("Error during minting tokens:", error);
  }
}

main().catch(console.error);
