console.clear();
require("dotenv").config();
const {
  Client,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  AccountAllowanceApproveTransaction,
  TokenUpdateTransaction,
  tr,
} = require("@hashgraph/sdk");
const fs = require("fs").promises;

const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.ACCOUNT_PRIVATE_KEY);
const account2Id = AccountId.fromString(process.env.ACCOUNT2_ID);
const account2Key = PrivateKey.fromStringECDSA(
  process.env.ACCOUNT2_PRIVATE_KEY
);
const account3Id = AccountId.fromString(process.env.ACCOUNT3_ID);
const account3Key = PrivateKey.fromStringECDSA(
  process.env.ACCOUNT3_PRIVATE_KEY
);
const treasuryEtherAddress = process.env.TREASURY_ADDRESS_ETHER;
const mstEtherAddress = process.env.MST_TOKEN_ADDRESS_ETHER;
const mptEtherAddress = process.env.MPT_TOKEN_ADDRESS_ETHER;
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
const mstTokenAddress = AccountId.fromString(process.env.MST_TOKEN_ADDRESS);
const mptTokenAddress = AccountId.fromString(process.env.MPT_TOKEN_ADDRESS);
const treasuryAccountId = AccountId.fromString(process.env.TREASURY_ADDRESS);

async function main() {
  // Ensure required environment variables are available
  if (
    !process.env.ACCOUNT_ID ||
    !process.env.ACCOUNT_PRIVATE_KEY ||
    !process.env.MST_TOKEN_ADDRESS ||
    !process.env.MPT_TOKEN_ADDRESS ||
    !process.env.TREASURY_ADDRESS
  ) {
    throw new Error("Please set required keys in .env file.");
  }

  const accountId = AccountId.fromString(process.env.ACCOUNT_ID);

  // Load contract bytecode
  const rewardDistributionBytecode = await fs.readFile(
    //"./RewardDis_sol_RewardDistribution.bin",
    "./sol3_sol_RewardDistribution.bin",
    {
      encoding: "utf8",
    }
  );

  // Create a file on Hedera and store the contract bytecode
  const fileCreateTx = new FileCreateTransaction()
    .setKeys([operatorKey])
    .freezeWith(client);
  const fileCreateSign = await fileCreateTx.sign(operatorKey);
  const fileCreateSubmit = await fileCreateSign.execute(client);
  const fileCreateRx = await fileCreateSubmit.getReceipt(client);
  const bytecodeFileId = fileCreateRx.fileId;
  console.log(`- The smart contract bytecode file ID is ${bytecodeFileId}`);

  // Append contents to the file
  const fileAppendTx = new FileAppendTransaction()
    .setFileId(bytecodeFileId)
    .setContents(rewardDistributionBytecode)
    .setMaxChunks(10)
    .freezeWith(client);
  const fileAppendSign = await fileAppendTx.sign(operatorKey);
  const fileAppendSubmit = await fileAppendSign.execute(client);
  const fileAppendRx = await fileAppendSubmit.getReceipt(client);
  console.log(`- Content added: ${fileAppendRx.status} \n`);

  // Deploy RewardDistribution contract
  const rewardDistributionCreateTx = new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(3000000) // Adjust gas limit as needed
    .setConstructorParameters(
      new ContractFunctionParameters()
        .addAddress(mstEtherAddress)
        .addAddress(mptEtherAddress)
        .addAddress(treasuryEtherAddress)
    )
    .setAdminKey(operatorKey);
  const rewardDistributionSubmit = await rewardDistributionCreateTx.execute(
    client
  );
  const rewardDistributionReceipt = await rewardDistributionSubmit.getReceipt(
    client
  );

  // Check if the contract creation was successful
  if (rewardDistributionReceipt.status.toString() !== "SUCCESS") {
    console.error(
      `- Contract creation failed with status: ${rewardDistributionReceipt.status.toString()}`
    );
    return;
  }

  const rewardDistributionContractId = rewardDistributionReceipt.contractId;
  console.log(
    `- RewardDistribution contract deployed at: ${rewardDistributionContractId}`
  );

  // Approve the token allowance for MPT
  const transactionAllowanceMST = new AccountAllowanceApproveTransaction()
    .approveTokenAllowance(
      process.env.MST_TOKEN_ADDRESS,
      operatorId,
      rewardDistributionContractId,
      100000
    )
    .approveTokenAllowance(
      process.env.MST_TOKEN_ADDRESS,
      account2Id,
      rewardDistributionContractId,
      100000
    )
    .approveTokenAllowance(
      process.env.MST_TOKEN_ADDRESS,
      account3Id,
      rewardDistributionContractId,
      100000
    )
    .freezeWith(client);

  // Sign the transaction with the necessary keys
  const signTxAllowanceMST = await transactionAllowanceMST.sign(operatorKey);
  const signTxAllowanceMST2 = await signTxAllowanceMST.sign(account2Key);
  const signTxAllowanceMST3 = await signTxAllowanceMST2.sign(account3Key);

  const txResponseAllowanceMST = await signTxAllowanceMST3.execute(client);
  const receiptAllowanceMST = await txResponseAllowanceMST.getReceipt(client);
  const transactionStatusAllowanceMST = receiptAllowanceMST.status;
  console.log(
    "The transaction consensus status for the MST allowance function is " +
      transactionStatusAllowanceMST.toString()
  );

  // Update MST token to be managed by the contract
  const tokenUpdateTxMST = await new TokenUpdateTransaction()
    .setTokenId(process.env.MST_TOKEN_ADDRESS)
    .setSupplyKey(operatorKey)
    .freezeWith(client)
    .sign(operatorKey);
  const tokenUpdateSubmitMST = await tokenUpdateTxMST.execute(client);
  const tokenUpdateRxMST = await tokenUpdateSubmitMST.getReceipt(client);
  console.log(`- MST Token update status: ${tokenUpdateRxMST.status}`);

  // Approve the token allowance for MPT
  const transactionAllowanceMPT = new AccountAllowanceApproveTransaction()
    .approveTokenAllowance(
      process.env.MPT_TOKEN_ADDRESS,
      operatorId,
      rewardDistributionContractId,
      1000000
    )
    .approveTokenAllowance(
      process.env.MPT_TOKEN_ADDRESS,
      account2Id,
      rewardDistributionContractId,
      1000000
    )
    .approveTokenAllowance(
      process.env.MPT_TOKEN_ADDRESS,
      account3Id,
      rewardDistributionContractId,
      1000000
    )
    .freezeWith(client);

  // Sign the transaction with the necessary keys
  const signTxAllowanceMPT = await transactionAllowanceMPT.sign(operatorKey);
  const signTxAllowanceMPT2 = await signTxAllowanceMPT.sign(account2Key);
  const signTxAllowanceMPT3 = await signTxAllowanceMPT2.sign(account3Key);

  const txResponseAllowanceMPT = await signTxAllowanceMPT3.execute(client);
  const receiptAllowanceMPT = await txResponseAllowanceMPT.getReceipt(client);
  const transactionStatusAllowanceMPT = receiptAllowanceMPT.status;
  console.log(
    "The transaction consensus status for the MPT allowance function is " +
      transactionStatusAllowanceMPT.toString()
  );

  // // Update MPT token to be managed by the contract
  // const tokenUpdateTxMPT = await new TokenUpdateTransaction()
  //   .setTokenId(process.env.MPT_TOKEN_ADDRESS)
  //   .setSupplyKey(operatorKey)
  //   .freezeWith(client)
  //   .sign(operatorKey);
  // const tokenUpdateSubmitMPT = await tokenUpdateTxMPT.execute(client);
  // const tokenUpdateRxMPT = await tokenUpdateSubmitMPT.getReceipt(client);
  // console.log(`- MPT Token update status: ${tokenUpdateRxMPT.status}`);

  // console.log(
  //   "The RewardDistribution contract has been successfully deployed and configured."
  // );
}

main().catch(console.error);
