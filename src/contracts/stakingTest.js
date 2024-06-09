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
  const account2Id = AccountId.fromString(process.env.ACCOUNT2_ID);
  const account2Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT2_PRIVATE_KEY
  );
  const account3Id = AccountId.fromString(process.env.ACCOUNT3_ID);
  const account3Key = PrivateKey.fromStringECDSA(
    process.env.ACCOUNT3_PRIVATE_KEY
  );
  const contractId = process.env.REWARD_DISTRIBUTION_CONTRACT_ID;

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const client2 = Client.forTestnet().setOperator(account2Id, account2Key);
  const client3 = Client.forTestnet().setOperator(account3Id, account3Key);

  try {
    // Step 1: Account 1 sends 1000 MPT and 2000 MST to both Account 2 and Account 3
    console.log(
      "Account 1 transferring 1000 MPT and 2000 MST to Account 2 and Account 3..."
    );

    try {
      const transferTx1 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "transferMptTokens",
          new ContractFunctionParameters()
            .addUint64(10000)
            .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
        )
        .setMaxTransactionFee(new Hbar(20));
      const transferTxSubmit1 = await transferTx1.execute(client);
      const transferTxReceipt1 = await transferTxSubmit1.getReceipt(client);
      console.log(
        `- Tokens transferred using transferMptTokens function to Account 2: ${transferTxReceipt1.status.toString()}`
      );
    } catch (error) {
      console.error(
        "Error during transfer of 1000 MPT to Account 2 using transferMptTokens function:",
        error
      );
    }

    // try {
    //   const transferTx1 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "transferMptTokens",
    //       new ContractFunctionParameters()
    //         .addUint64(10000)
    //         .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const transferTxSubmit1 = await transferTx1.execute(client);
    //   const transferTxReceipt1 = await transferTxSubmit1.getReceipt(client);
    //   console.log(
    //     `- Tokens transferred using transferMptTokens function to Account 2: ${transferTxReceipt1.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during transfer of 1000 MPT to Account 2 using transferMptTokens function:",
    //     error
    //   );
    // }

    // try {
    //   const transferTx2 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "transferMptTokens",
    //       new ContractFunctionParameters()
    //         .addUint64(10000)
    //         .addAddress(process.env.ACCOUNT3_ADDRESS_ETHER)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const transferTxSubmit2 = await transferTx2.execute(client);
    //   const transferTxReceipt2 = await transferTxSubmit2.getReceipt(client);
    //   console.log(
    //     `- Tokens transferred using transferMptTokens function to Account 3: ${transferTxReceipt2.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during transfer of 1000 MPT to Account 3 using transferMptTokens function:",
    //     error
    //   );
    // }

    // try {
    //   const transferTx3 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "transferMstTokens",
    //       new ContractFunctionParameters()
    //         .addUint64(10000)
    //         .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const transferTxSubmit3 = await transferTx3.execute(client);
    //   const transferTxReceipt3 = await transferTxSubmit3.getReceipt(client);
    //   console.log(
    //     `- Tokens transferred using transferMstTokens function to Account 2: ${transferTxReceipt3.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during transfer of 2000 MST to Account 2 using transferMstTokens function:",
    //     error
    //   );
    // }

    // try {
    //   const transferTx4 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "transferMstTokens",
    //       new ContractFunctionParameters()
    //         .addUint64(10000)
    //         .addAddress(process.env.ACCOUNT3_ADDRESS_ETHER)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const transferTxSubmit4 = await transferTx4.execute(client);
    //   const transferTxReceipt4 = await transferTxSubmit4.getReceipt(client);
    //   console.log(
    //     `- Tokens transferred using transferMstTokens function to Account 3: ${transferTxReceipt4.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during transfer of 2000 MST to Account 3 using transferMstTokens function:",
    //     error
    //   );
    // }

    // console.log("Transfer complete.");
    // try {
    //   const transferTx4 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "transferMstTokens",
    //       new ContractFunctionParameters()
    //         .addUint64(10000)
    //         .addAddress(process.env.ACCOUNT1_ADDRESS_ETHER)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const transferTxSubmit4 = await transferTx4.execute(client);
    //   const transferTxReceipt4 = await transferTxSubmit4.getReceipt(client);
    //   console.log(
    //     `- Tokens transferred using transferMstTokens function to Account 3: ${transferTxReceipt4.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during transfer of 2000 MST to Account 3 using transferMstTokens function:",
    //     error
    //   );
    // }

    // // Step 2: Account 2 stakes 1000 MST
    // console.log("Account 2 staking 1000 MST...");
    // try {
    //   const stakeTx2 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "stakeTokens",
    //       new ContractFunctionParameters().addUint64(1000)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const stakeTxSubmit2 = await stakeTx2.execute(client2);
    //   const stakeTxReceipt2 = await stakeTxSubmit2.getReceipt(client2);
    //   console.log(
    //     `- Tokens staked by Account 2 using stakeTokens function: ${stakeTxReceipt2.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during staking of 1000 MST by Account 2 using stakeTokens function:",
    //     error
    //   );
    // }

    // // Step 3: Account 3 stakes 500 MST
    // console.log("Account 3 staking 500 MST...");
    // try {
    //   const stakeTx3 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "stakeTokens",
    //       new ContractFunctionParameters().addUint64(500)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const stakeTxSubmit3 = await stakeTx3.execute(client3);
    //   const stakeTxReceipt3 = await stakeTxSubmit3.getReceipt(client3);
    //   console.log(
    //     `- Tokens staked by Account 3 using stakeTokens function: ${stakeTxReceipt3.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during staking of 500 MST by Account 3 using stakeTokens function:",
    //     error
    //   );
    // }

    // // Step 4: Account 2 sends 1000 MPT to Account 3
    // console.log("Account 2 transferring 1000 MPT to Account 3...");
    // try {
    //   const transferMptTx1 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "transferMptTokens",
    //       new ContractFunctionParameters()
    //         .addUint64(1000)
    //         .addAddress(process.env.ACCOUNT3_ADDRESS_ETHER)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const transferMptTxSubmit1 = await transferMptTx1.execute(client2);
    //   const transferMptTxReceipt1 = await transferMptTxSubmit1.getReceipt(client2);
    //   console.log(
    //     `- Tokens transferred by Account 2 to Account 3 using transferMptTokens function: ${transferMptTxReceipt1.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during transfer of 1000 MPT by Account 2 to Account 3 using transferMptTokens function:",
    //     error
    //   );
    // }

    // // Step 5: Account 3 sends 1000 MPT to Account 2
    // console.log("Account 3 transferring 1000 MPT to Account 2...");
    // try {
    //   const transferMptTx2 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction(
    //       "transferMptTokens",
    //       new ContractFunctionParameters()
    //         .addUint64(1000)
    //         .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
    //     )
    //     .setMaxTransactionFee(new Hbar(20));
    //   const transferMptTxSubmit2 = await transferMptTx2.execute(client3);
    //   const transferMptTxReceipt2 = await transferMptTxSubmit2.getReceipt(client3);
    //   console.log(
    //     `- Tokens transferred by Account 3 to Account 2 using transferMptTokens function: ${transferMptTxReceipt2.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during transfer of 1000 MPT by Account 3 to Account 2 using transferMptTokens function:",
    //     error
    //   );
    // }

    // // Step 6: Account 2 claims rewards
    // console.log("Account 2 claiming rewards...");
    // try {
    //   const claimRewardsTx2 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction("claimRewards")
    //     .setMaxTransactionFee(new Hbar(20));
    //   const claimRewardsTxSubmit2 = await claimRewardsTx2.execute(client2);
    //   const claimRewardsTxReceipt2 = await claimRewardsTxSubmit2.getReceipt(client2);
    //   console.log(
    //     `- Rewards claimed by Account 2 using claimRewards function: ${claimRewardsTxReceipt2.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during claiming rewards by Account 2 using claimRewards function:",
    //     error
    //   );
    // }

    // // Step 7: Account 3 claims rewards
    // console.log("Account 3 claiming rewards...");
    // try {
    //   const claimRewardsTx3 = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(3000000)
    //     .setFunction("claimRewards")
    //     .setMaxTransactionFee(new Hbar(20));
    //   const claimRewardsTxSubmit3 = await claimRewardsTx3.execute(client3);
    //   const claimRewardsTxReceipt3 = await claimRewardsTxSubmit3.getReceipt(client3);
    //   console.log(
    //     `- Rewards claimed by Account 3 using claimRewards function: ${claimRewardsTxReceipt3.status.toString()}`
    //   );
    // } catch (error) {
    //   console.error(
    //     "Error during claiming rewards by Account 3 using claimRewards function:",
    //     error
    //   );
    // }

    // console.log("All transactions executed successfully.");
  } catch (error) {
    console.error("Error during contract interaction:", error);
  }
}

main().catch(console.error);
