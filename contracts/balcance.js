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
const axios = require("axios");

async function queryMirrorNodeFor(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error querying mirror node: ${error}`);
    return null;
  }
}

async function get_token_balance(account_id, token_id) {
  const base_url = "https://testnet.mirrornode.hedera.com/api/v1";
  const url = `${base_url}/balances?account.id=${account_id}&limit=1`;

  const balance_info = await queryMirrorNodeFor(url);

  if (balance_info && balance_info.balances) {
    for (const item of balance_info.balances) {
      if (item.account === account_id) {
        for (const token of item.tokens) {
          if (token.token_id === token_id) {
            const token_info_url = `${base_url}/tokens/${token_id}`;
            const token_info = await queryMirrorNodeFor(token_info_url);

            if (token_info && token_info.decimals !== undefined) {
              const decimals = parseFloat(token_info.decimals);
              const balance = token.balance / 10 ** decimals;
              return balance * 10000;
            }
          }
        }
      }
    }
  }
  return null;
}

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

  const accountId = process.env.ACCOUNT_ID;
  const account2Address = process.env.ACCOUNT2_ADDRESS_ETHER;
  const account3Address = process.env.ACCOUNT3_ADDRESS_ETHER;
  const mstTokenId = process.env.MST_TOKEN_ADDRESS;
  const mptTokenId = process.env.MPT_TOKEN_ADDRESS;

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const client2 = Client.forTestnet().setOperator(account2Id, account2Key);
  const client3 = Client.forTestnet().setOperator(account3Id, account3Key);

  try {
    // Step 1: Account 1 sends 1000 MPT and 2000 MST to both Account 2 and Account 3
    console.log(
      "Account 1 transferring 1000 MPT and 2000 MST to Account 2 and Account 3..."
    );

    const transferTx1 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMptTokens",
        new ContractFunctionParameters()
          .addUint64(1000)
          .addAddress(account2Address)
      )
      .setMaxTransactionFee(new Hbar(20));
    await transferTx1.execute(client);

    const transferTx2 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMptTokens",
        new ContractFunctionParameters()
          .addUint64(1000)
          .addAddress(account3Address)
      )
      .setMaxTransactionFee(new Hbar(20));
    await transferTx2.execute(client);

    const transferTx3 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMstTokens",
        new ContractFunctionParameters()
          .addUint64(2000)
          .addAddress(account2Address)
      )
      .setMaxTransactionFee(new Hbar(20));
    await transferTx3.execute(client);

    const transferTx4 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMstTokens",
        new ContractFunctionParameters()
          .addUint64(2000)
          .addAddress(account3Address)
      )
      .setMaxTransactionFee(new Hbar(20));
    await transferTx4.execute(client);

    console.log("Transfer complete.");

    // Print balances after step 1
    console.log("Balances after step 1:");
    console.log(
      `Account 1 MST Balance: ${await get_token_balance(accountId, mstTokenId)}`
    );
    console.log(
      `Account 2 MST Balance: ${await get_token_balance(
        account2Id.toString(),
        mstTokenId
      )}`
    );
    console.log(
      `Account 3 MST Balance: ${await get_token_balance(
        account3Id.toString(),
        mstTokenId
      )}`
    );
    console.log(
      `Account 2 MPT Balance: ${await get_token_balance(
        account2Id.toString(),
        mptTokenId
      )}`
    );
    console.log(
      `Account 3 MPT Balance: ${await get_token_balance(
        account3Id.toString(),
        mptTokenId
      )}`
    );

    // Step 2: Account 2 stakes 1000 MST
    console.log("Account 2 staking 1000 MST...");
    const stakeTx2 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "stakeTokens",
        new ContractFunctionParameters().addUint64(1000)
      )
      .setMaxTransactionFee(new Hbar(20));
    await stakeTx2.execute(client2);
    console.log("Account 2 staked 1000 MST.");

    // Print balances after step 2
    console.log("Balances after step 2:");
    console.log(
      `Account 2 MST Balance: ${await get_token_balance(
        account2Id.toString(),
        mstTokenId
      )}`
    );

    // Step 3: Account 3 stakes 500 MST
    console.log("Account 3 staking 500 MST...");
    const stakeTx3 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "stakeTokens",
        new ContractFunctionParameters().addUint64(500)
      )
      .setMaxTransactionFee(new Hbar(20));
    await stakeTx3.execute(client3);
    console.log("Account 3 staked 500 MST.");

    // Print balances after step 3
    console.log("Balances after step 3:");
    console.log(
      `Account 3 MST Balance: ${await get_token_balance(
        account3Id.toString(),
        mstTokenId
      )}`
    );

    // Step 4: Account 2 sends 1000 MPT to Account 3
    console.log("Account 2 transferring 1000 MPT to Account 3...");
    const transferMptTx1 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMptTokens",
        new ContractFunctionParameters()
          .addUint64(1000)
          .addAddress(account3Address)
      )
      .setMaxTransactionFee(new Hbar(20));
    await transferMptTx1.execute(client2);
    console.log("Account 2 transferred 1000 MPT to Account 3.");

    // Print balances after step 4
    console.log("Balances after step 4:");
    console.log(
      `Account 2 MPT Balance: ${await get_token_balance(
        account2Id.toString(),
        mptTokenId
      )}`
    );
    console.log(
      `Account 3 MPT Balance: ${await get_token_balance(
        account3Id.toString(),
        mptTokenId
      )}`
    );

    // Step 5: Account 3 sends 1000 MPT to Account 2
    console.log("Account 3 transferring 1000 MPT to Account 2...");
    const transferMptTx2 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "transferMptTokens",
        new ContractFunctionParameters()
          .addUint64(1000)
          .addAddress(account2Address)
      )
      .setMaxTransactionFee(new Hbar(20));
    await transferMptTx2.execute(client3);
    console.log("Account 3 transferred 1000 MPT to Account 2.");

    // Print balances after step 5
    console.log("Balances after step 5:");
    console.log(
      `Account 2 MPT Balance: ${await get_token_balance(
        account2Id.toString(),
        mptTokenId
      )}`
    );
    console.log(
      `Account 3 MPT Balance: ${await get_token_balance(
        account3Id.toString(),
        mptTokenId
      )}`
    );

    // Step 6: Account 2 claims rewards
    console.log("Account 2 claiming rewards...");
    const claimRewardsTx2 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction("claimRewards")
      .setMaxTransactionFee(new Hbar(20));
    await claimRewardsTx2.execute(client2);
    console.log("Account 2 claimed rewards.");

    // Print balances after step 6
    console.log("Balances after step 6:");
    console.log(
      `Account 2 MST Balance: ${await get_token_balance(
        account2Id.toString(),
        mstTokenId
      )}`
    );
    console.log(
      `Account 2 MPT Balance: ${await get_token_balance(
        account2Id.toString(),
        mptTokenId
      )}`
    );

    // Step 7: Account 3 claims rewards
    console.log("Account 3 claiming rewards...");
    const claimRewardsTx3 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction("claimRewards")
      .setMaxTransactionFee(new Hbar(20));
    await claimRewardsTx3.execute(client3);
    console.log("Account 3 claimed rewards.");

    // Print balances after step 7
    console.log("Balances after step 7:");
    console.log(
      `Account 3 MST Balance: ${await get_token_balance(
        account3Id.toString(),
        mstTokenId
      )}`
    );
    console.log(
      `Account 3 MPT Balance: ${await get_token_balance(
        account3Id.toString(),
        mptTokenId
      )}`
    );

    // Step 8: Account 2 unstakes 1000 MST
    console.log("Account 2 unstaking 1000 MST...");
    const unstakeTx2 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "unstakeTokens",
        new ContractFunctionParameters().addUint64(1000)
      )
      .setMaxTransactionFee(new Hbar(20));
    await unstakeTx2.execute(client2);
    console.log("Account 2 unstaked 1000 MST.");

    // Print balances after step 8
    console.log("Balances after step 8:");
    console.log(
      `Account 2 MST Balance: ${await get_token_balance(
        account2Id.toString(),
        mstTokenId
      )}`
    );

    // Step 9: Account 3 unstakes 500 MST
    console.log("Account 3 unstaking 500 MST...");
    const unstakeTx3 = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "unstakeTokens",
        new ContractFunctionParameters().addUint64(500)
      )
      .setMaxTransactionFee(new Hbar(20));
    await unstakeTx3.execute(client3);
    console.log("Account 3 unstaked 500 MST.");

    // Print balances after step 9
    console.log("Balances after step 9:");
    console.log(
      `Account 3 MST Balance: ${await get_token_balance(
        account3Id.toString(),
        mstTokenId
      )}`
    );

    console.log("All transactions executed successfully.");
  } catch (error) {
    console.error("Error during contract interaction:", error);
  }
}

main().catch(console.error);
