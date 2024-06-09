console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
} = require("@hashgraph/sdk");

async function main() {
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT_PRIVATE_KEY
  );
  const account1Id = AccountId.fromString(process.env.ACCOUNT1_ID);
  const account2Id = AccountId.fromString(process.env.ACCOUNT2_ID);
  const account3Id = AccountId.fromString(process.env.ACCOUNT3_ID);
  const contractId = process.env.REWARD_DISTRIBUTION_CONTRACT_ID;

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  try {
    // Step 1: Operator sends 20,000 MPT and 20,000 MST tokens to Account 1
    console.log(
      "Operator transferring 20,000 MPT and 20,000 MST to Account 1..."
    );

    const transferTx1 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMptTokens",
        new ContractFunctionParameters()
          .addUint64(20000)
          .addAddress(process.env.ACCOUNT1_ADDRESS_ETHER)
      )
      .setMaxTransactionFee(new Hbar(20));
    const transferTxSubmit1 = await transferTx1.execute(client);
    const transferTxReceipt1 = await transferTxSubmit1.getReceipt(client);
    console.log(
      `- Tokens transferred using transferMptTokens function to Account 1: ${transferTxReceipt1.status.toString()}`
    );

    const transferTx2 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMstTokens",
        new ContractFunctionParameters()
          .addUint64(20000)
          .addAddress(process.env.ACCOUNT1_ADDRESS_ETHER)
      )
      .setMaxTransactionFee(new Hbar(20));
    const transferTxSubmit2 = await transferTx2.execute(client);
    const transferTxReceipt2 = await transferTxSubmit2.getReceipt(client);
    console.log(
      `- Tokens transferred using transferMstTokens function to Account 1: ${transferTxReceipt2.status.toString()}`
    );

    // Step 2: Operator sends 20,000 MPT and 20,000 MST tokens to Account 2
    console.log(
      "Operator transferring 20,000 MPT and 20,000 MST to Account 2..."
    );

    const transferTx3 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMptTokens",
        new ContractFunctionParameters()
          .addUint64(20000)
          .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
      )
      .setMaxTransactionFee(new Hbar(20));
    const transferTxSubmit3 = await transferTx3.execute(client);
    const transferTxReceipt3 = await transferTxSubmit3.getReceipt(client);
    console.log(
      `- Tokens transferred using transferMptTokens function to Account 2: ${transferTxReceipt3.status.toString()}`
    );

    const transferTx4 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMstTokens",
        new ContractFunctionParameters()
          .addUint64(20000)
          .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
      )
      .setMaxTransactionFee(new Hbar(20));
    const transferTxSubmit4 = await transferTx4.execute(client);
    const transferTxReceipt4 = await transferTxSubmit4.getReceipt(client);
    console.log(
      `- Tokens transferred using transferMstTokens function to Account 2: ${transferTxReceipt4.status.toString()}`
    );

    // Step 3: Operator sends 20,000 MPT and 20,000 MST tokens to Account 3
    console.log(
      "Operator transferring 20,000 MPT and 20,000 MST to Account 3..."
    );

    const transferTx5 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMptTokens",
        new ContractFunctionParameters()
          .addUint64(20000)
          .addAddress(process.env.ACCOUNT3_ADDRESS_ETHER)
      )
      .setMaxTransactionFee(new Hbar(20));
    const transferTxSubmit5 = await transferTx5.execute(client);
    const transferTxReceipt5 = await transferTxSubmit5.getReceipt(client);
    console.log(
      `- Tokens transferred using transferMptTokens function to Account 3: ${transferTxReceipt5.status.toString()}`
    );

    const transferTx6 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMstTokens",
        new ContractFunctionParameters()
          .addUint64(20000)
          .addAddress(process.env.ACCOUNT3_ADDRESS_ETHER)
      )
      .setMaxTransactionFee(new Hbar(20));
    const transferTxSubmit6 = await transferTx6.execute(client);
    const transferTxReceipt6 = await transferTxSubmit6.getReceipt(client);
    console.log(
      `- Tokens transferred using transferMstTokens function to Account 3: ${transferTxReceipt6.status.toString()}`
    );

    console.log("Transfer complete.");
  } catch (error) {
    console.error("Error during contract interaction:", error);
  }
}

main().catch(console.error);
