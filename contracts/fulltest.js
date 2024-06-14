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

const baseUrl = "https://testnet.mirrornode.hedera.com/api/v1";
const contractId = process.env.REWARD_DISTRIBUTION_CONTRACT_ID;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function queryMirrorNodeFor(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error querying Mirror Node for URL ${url}:`, error);
    return null;
  }
}

async function getTokenBalance(accountId, tokenId) {
  try {
    const url = `${baseUrl}/balances?account.id=${accountId}`;
    const balanceInfo = await queryMirrorNodeFor(url);

    if (balanceInfo && balanceInfo.balances) {
      for (const item of balanceInfo.balances) {
        if (item.account === accountId) {
          for (const token of item.tokens) {
            if (token.token_id === tokenId) {
              const tokenInfoUrl = `${baseUrl}/tokens/${tokenId}`;
              const tokenInfo = await queryMirrorNodeFor(tokenInfoUrl);

              if (tokenInfo && tokenInfo.decimals !== undefined) {
                const decimals = parseFloat(tokenInfo.decimals);
                const balance = token.balance / 10 ** decimals;
                return Math.floor(balance * 10000); // Adjust as necessary
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(
      `Error getting token balance for account ${accountId} and token ${tokenId}:`,
      error
    );
  }
  return null;
}

async function getRewardPool(client, contractId) {
  try {
    const query = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction("getRewardPool");
    const transactionId = await query.execute(client);
    const record = await transactionId.getRecord(client);
    const result = record.contractFunctionResult;
    const rewardPool = result.getUint64(0).toString();
    return rewardPool;
  } catch (error) {
    console.error(
      `Error getting reward pool for contract ${contractId}:`,
      error
    );
    return null;
  }
}

async function getStakesAndRewards(client, contractId, account) {
  try {
    const stakesQuery = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "getStakes",
        new ContractFunctionParameters().addAddress(account)
      );
    const stakesTransactionId = await stakesQuery.execute(client);
    const stakesRecord = await stakesTransactionId.getRecord(client);
    const stakesContractFunctionResult = stakesRecord.contractFunctionResult;
    const stakes = stakesContractFunctionResult.getUint64(0).toString();

    const rewardsQuery = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction("getMyReward", new ContractFunctionParameters());
    const rewardsTransactionId = await rewardsQuery.execute(client);
    const rewardsRecord = await rewardsTransactionId.getRecord(client);
    const rewardsContractFunctionResult = rewardsRecord.contractFunctionResult;
    const rewards = rewardsContractFunctionResult.getUint64(0).toString();

    return { stakes, rewards };
  } catch (error) {
    console.error(
      `Error getting stakes and rewards for account ${account}:`,
      error
    );
    return { stakes: null, rewards: null };
  }
}

async function getLastCumulativeRewardPerToken(client, contractId, account) {
  try {
    const query = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction(
        "getLastCumulativeRewardPerToken",
        new ContractFunctionParameters().addAddress(account)
      );
    const transactionId = await query.execute(client);
    const record = await transactionId.getRecord(client);
    const result = record.contractFunctionResult;
    const lastCumulativeRewardPerToken = result.getUint64(0).toString(); // Changed to getUint64
    return lastCumulativeRewardPerToken;
  } catch (error) {
    console.error(
      `Error getting last cumulative reward per token for account ${account}:`,
      error
    );
    return null;
  }
}

async function getCumulativeRewardPerToken(client, contractId) {
  try {
    const query = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(3000000)
      .setFunction("getCumulativeRewardPerToken");
    const transactionId = await query.execute(client);
    const record = await transactionId.getRecord(client);
    const result = record.contractFunctionResult;
    const cumulativeRewardPerToken = result.getUint64(0).toString(); // Changed to getUint64
    return cumulativeRewardPerToken;
  } catch (error) {
    console.error(
      `Error getting cumulative reward per token for contract ${contractId}:`,
      error
    );
    return null;
  }
}

async function claimRewards(client) {
  try {
    const claimRewardsTx = await new ContractExecuteTransaction()
      .setContractId(process.env.REWARD_DISTRIBUTION_CONTRACT_ID)
      .setGas(3000000)
      .setFunction("claimRewards")
      .setMaxTransactionFee(new Hbar(20));
    const claimRewardsSubmit = await claimRewardsTx.execute(client);
    const claimRewardsReceipt = await claimRewardsSubmit.getReceipt(client);
    console.log(`- Rewards claimed: ${claimRewardsReceipt.status.toString()}`);
  } catch (error) {
    console.error(`Error claiming rewards:`, error);
  }
}

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

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const client1 = Client.forTestnet().setOperator(account1Id, account1Key);
  const client2 = Client.forTestnet().setOperator(account2Id, account2Key);
  const client3 = Client.forTestnet().setOperator(account3Id, account3Key);

  try {
    // Log initial balances
    console.log("Balances at the beginning:");
    try {
      console.log(
        `Account 1 MST: ${await getTokenBalance(
          process.env.ACCOUNT1_ID,
          process.env.MST_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 1 MPT: ${await getTokenBalance(
          process.env.ACCOUNT1_ID,
          process.env.MPT_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 2 MST: ${await getTokenBalance(
          process.env.ACCOUNT2_ID,
          process.env.MST_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 2 MPT: ${await getTokenBalance(
          process.env.ACCOUNT2_ID,
          process.env.MPT_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 3 MST: ${await getTokenBalance(
          process.env.ACCOUNT3_ID,
          process.env.MST_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 3 MPT: ${await getTokenBalance(
          process.env.ACCOUNT3_ID,
          process.env.MPT_TOKEN_ADDRESS
        )}`
      );
    } catch (error) {
      console.error("Error logging initial balances:", error);
    }

    // Check initial stakes and rewards
    console.log("Initial stakes and rewards:");
    try {
      console.log("Reward Pool:", await getRewardPool(client, contractId));

      console.log(
        "Account 1:",
        await getStakesAndRewards(
          client1,
          contractId,
          process.env.ACCOUNT1_ADDRESS_ETHER
        )
      );
      console.log(
        "Account 2:",
        await getStakesAndRewards(
          client2,
          contractId,
          process.env.ACCOUNT2_ADDRESS_ETHER
        )
      );
      console.log(
        "Account 3:",
        await getStakesAndRewards(
          client3,
          contractId,
          process.env.ACCOUNT3_ADDRESS_ETHER
        )
      );
    } catch (error) {
      console.error("Error checking initial stakes and rewards:", error);
    }

    // Step 1: Account 1 stakes 4000 MST
    console.log("Account 1 staking 4000 MST...");
    try {
      const stakeTx1 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "stakeTokens",
          new ContractFunctionParameters().addUint64(4000)
        )
        .setMaxTransactionFee(new Hbar(20));
      const stakeTxSubmit1 = await stakeTx1.execute(client1);
      const stakeTxReceipt1 = await stakeTxSubmit1.getReceipt(client1);
      console.log(
        `- Tokens staked by Account 1 using stakeTokens function: ${stakeTxReceipt1.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during staking of 4000 MST by Account 1 using stakeTokens function:",
        error
      );
    }

    // Call getStakesAndRewards and getCumulativeRewardPerToken
    console.log("Stakes and rewards for Account 1 after staking:");
    try {
      const { stakes, rewards } = await getStakesAndRewards(
        client1,
        contractId,
        process.env.ACCOUNT1_ADDRESS_ETHER
      );
      const lastCumulative = await getLastCumulativeRewardPerToken(
        client1,
        contractId,
        process.env.ACCOUNT1_ADDRESS_ETHER
      );
      const currentCumulative = await getCumulativeRewardPerToken(
        client,
        contractId
      );
      console.log(
        `Stakes: ${stakes}, Rewards: ${rewards}, Last Cumulative: ${lastCumulative}, Current Cumulative: ${currentCumulative}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error getting stakes and rewards for Account 1 after staking:",
        error
      );
    }

    // Step 2: Account 1 transfers 4000 MPT to Account 2
    console.log("Account 1 transferring 4000 MPT to Account 2...");
    try {
      const transferMptTx1 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "transferMptTokens",
          new ContractFunctionParameters()
            .addUint64(4000)
            .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
        )
        .setMaxTransactionFee(new Hbar(20));
      const transferMptTxSubmit1 = await transferMptTx1.execute(client1);
      const transferMptTxReceipt1 = await transferMptTxSubmit1.getReceipt(
        client1
      );
      console.log(
        `- Tokens transferred by Account 1 to Account 2 using transferMptTokens function: ${transferMptTxReceipt1.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during transfer of 4000 MPT by Account 1 to Account 2 using transferMptTokens function:",
        error
      );
    }

    // Call getStakesAndRewards and getCumulativeRewardPerToken
    console.log("Stakes and rewards for Account 1 after transfer:");
    try {
      const { stakes, rewards } = await getStakesAndRewards(
        client1,
        contractId,
        process.env.ACCOUNT1_ADDRESS_ETHER
      );
      const lastCumulative = await getLastCumulativeRewardPerToken(
        client1,
        contractId,
        process.env.ACCOUNT1_ADDRESS_ETHER
      );
      const currentCumulative = await getCumulativeRewardPerToken(
        client,
        contractId
      );
      console.log(
        `Stakes: ${stakes}, Rewards: ${rewards}, Last Cumulative: ${lastCumulative}, Current Cumulative: ${currentCumulative}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error getting stakes and rewards for Account 1 after transfer:",
        error
      );
    }

    // Step 3: Account 2 stakes 4000 MST
    console.log("Account 2 staking 4000 MST...");
    try {
      const stakeTx2 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "stakeTokens",
          new ContractFunctionParameters().addUint64(4000)
        )
        .setMaxTransactionFee(new Hbar(20));
      const stakeTxSubmit2 = await stakeTx2.execute(client2);
      const stakeTxReceipt2 = await stakeTxSubmit2.getReceipt(client2);
      console.log(
        `- Tokens staked by Account 2 using stakeTokens function: ${stakeTxReceipt2.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during staking of 4000 MST by Account 2 using stakeTokens function:",
        error
      );
    }

    // Call getStakesAndRewards and getCumulativeRewardPerToken
    console.log("Stakes and rewards for Account 2 after staking:");
    try {
      const { stakes, rewards } = await getStakesAndRewards(
        client2,
        contractId,
        process.env.ACCOUNT2_ADDRESS_ETHER
      );
      const lastCumulative = await getLastCumulativeRewardPerToken(
        client2,
        contractId,
        process.env.ACCOUNT2_ADDRESS_ETHER
      );
      const currentCumulative = await getCumulativeRewardPerToken(
        client,
        contractId
      );
      console.log(
        `Stakes: ${stakes}, Rewards: ${rewards}, Last Cumulative: ${lastCumulative}, Current Cumulative: ${currentCumulative}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error getting stakes and rewards for Account 2 after staking:",
        error
      );
    }

    // Step 4: Account 2 transfers 4000 MPT to Account 3
    console.log("Account 2 transferring 4000 MPT to Account 3...");
    try {
      const transferMptTx2 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "transferMptTokens",
          new ContractFunctionParameters()
            .addUint64(4000)
            .addAddress(process.env.ACCOUNT3_ADDRESS_ETHER)
        )
        .setMaxTransactionFee(new Hbar(20));
      const transferMptTxSubmit2 = await transferMptTx2.execute(client2);
      const transferMptTxReceipt2 = await transferMptTxSubmit2.getReceipt(
        client2
      );
      console.log(
        `- Tokens transferred by Account 2 to Account 3 using transferMptTokens function: ${transferMptTxReceipt2.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during transfer of 4000 MPT by Account 2 to Account 3 using transferMptTokens function:",
        error
      );
    }

    // Call getStakesAndRewards and getCumulativeRewardPerToken
    console.log("Stakes and rewards for Account 2 after transfer:");
    try {
      const { stakes, rewards } = await getStakesAndRewards(
        client2,
        contractId,
        process.env.ACCOUNT2_ADDRESS_ETHER
      );
      const lastCumulative = await getLastCumulativeRewardPerToken(
        client2,
        contractId,
        process.env.ACCOUNT2_ADDRESS_ETHER
      );
      const currentCumulative = await getCumulativeRewardPerToken(
        client,
        contractId
      );
      console.log(
        `Stakes: ${stakes}, Rewards: ${rewards}, Last Cumulative: ${lastCumulative}, Current Cumulative: ${currentCumulative}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error getting stakes and rewards for Account 2 after transfer:",
        error
      );
    }

    // Step 5: Account 3 stakes 4000 MST
    console.log("Account 3 staking 4000 MST...");
    try {
      const stakeTx3 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "stakeTokens",
          new ContractFunctionParameters().addUint64(4000)
        )
        .setMaxTransactionFee(new Hbar(20));
      const stakeTxSubmit3 = await stakeTx3.execute(client3);
      const stakeTxReceipt3 = await stakeTxSubmit3.getReceipt(client3);
      console.log(
        `- Tokens staked by Account 3 using stakeTokens function: ${stakeTxReceipt3.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during staking of 4000 MST by Account 3 using stakeTokens function:",
        error
      );
    }

    // Call getStakesAndRewards and getCumulativeRewardPerToken
    console.log("Stakes and rewards for Account 3 after staking:");
    try {
      const { stakes, rewards } = await getStakesAndRewards(
        client3,
        contractId,
        process.env.ACCOUNT3_ADDRESS_ETHER
      );
      const lastCumulative = await getLastCumulativeRewardPerToken(
        client3,
        contractId,
        process.env.ACCOUNT3_ADDRESS_ETHER
      );
      const currentCumulative = await getCumulativeRewardPerToken(
        client,
        contractId
      );
      console.log(
        `Stakes: ${stakes}, Rewards: ${rewards}, Last Cumulative: ${lastCumulative}, Current Cumulative: ${currentCumulative}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error getting stakes and rewards for Account 3 after staking:",
        error
      );
    }

    // Step 6: Account 3 transfers 4000 MPT to Account 1 and 4000 MPT to Account 2
    console.log("Account 3 transferring 4000 MPT to Account 1...");
    try {
      const transferMptTx3 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "transferMptTokens",
          new ContractFunctionParameters()
            .addUint64(4000)
            .addAddress(process.env.ACCOUNT1_ADDRESS_ETHER)
        )
        .setMaxTransactionFee(new Hbar(20));
      const transferMptTxSubmit3 = await transferMptTx3.execute(client3);
      const transferMptTxReceipt3 = await transferMptTxSubmit3.getReceipt(
        client3
      );
      console.log(
        `- Tokens transferred by Account 3 to Account 1 using transferMptTokens function: ${transferMptTxReceipt3.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during transfer of 4000 MPT by Account 3 to Account 1 using transferMptTokens function:",
        error
      );
    }

    console.log("Account 3 transferring 4000 MPT to Account 2...");
    try {
      const transferMptTx4 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "transferMptTokens",
          new ContractFunctionParameters()
            .addUint64(4000)
            .addAddress(process.env.ACCOUNT2_ADDRESS_ETHER)
        )
        .setMaxTransactionFee(new Hbar(20));
      const transferMptTxSubmit4 = await transferMptTx4.execute(client3);
      const transferMptTxReceipt4 = await transferMptTxSubmit4.getReceipt(
        client3
      );
      console.log(
        `- Tokens transferred by Account 3 to Account 2 using transferMptTokens function: ${transferMptTxReceipt4.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during transfer of 4000 MPT by Account 3 to Account 2 using transferMptTokens function:",
        error
      );
    }

    // Call getStakesAndRewards and getCumulativeRewardPerToken
    console.log("Stakes and rewards for Account 3 after transfers:");
    try {
      const { stakes, rewards } = await getStakesAndRewards(
        client3,
        contractId,
        process.env.ACCOUNT3_ADDRESS_ETHER
      );
      const lastCumulative = await getLastCumulativeRewardPerToken(
        client3,
        contractId,
        process.env.ACCOUNT3_ADDRESS_ETHER
      );
      const currentCumulative = await getCumulativeRewardPerToken(
        client,
        contractId
      );
      console.log(
        `Stakes: ${stakes}, Rewards: ${rewards}, Last Cumulative: ${lastCumulative}, Current Cumulative: ${currentCumulative}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error getting stakes and rewards for Account 3 after transfers:",
        error
      );
    }

    // Claim rewards before unstaking
    try {
      console.log(
        "Reward Pool before claiming:",
        await getRewardPool(client, contractId)
      );

      console.log(
        "Stakes and rewards for Account 1 before claiming:",
        await getStakesAndRewards(
          client1,
          contractId,
          process.env.ACCOUNT1_ADDRESS_ETHER
        )
      );

      console.log("Claiming rewards for Account 1...");
      await claimRewards(client1);
      await delay(5000); // 5-second delay
      console.log(
        "Stakes and rewards for Account 1 after claiming:",
        await getStakesAndRewards(
          client1,
          contractId,
          process.env.ACCOUNT1_ADDRESS_ETHER
        )
      );

      console.log(
        "Stakes and rewards for Account 2 before claiming:",
        await getStakesAndRewards(
          client2,
          contractId,
          process.env.ACCOUNT2_ADDRESS_ETHER
        )
      );

      console.log("Claiming rewards for Account 2...");
      await claimRewards(client2);
      await delay(5000); // 5-second delay
      console.log(
        "Stakes and rewards for Account 2 after claiming:",
        await getStakesAndRewards(
          client2,
          contractId,
          process.env.ACCOUNT2_ADDRESS_ETHER
        )
      );

      console.log(
        "Stakes and rewards for Account 3 before claiming:",
        await getStakesAndRewards(
          client3,
          contractId,
          process.env.ACCOUNT3_ADDRESS_ETHER
        )
      );

      console.log("Claiming rewards for Account 3...");
      await claimRewards(client3);
      await delay(5000); // 5-second delay
      console.log(
        "Stakes and rewards for Account 3 after claiming:",
        await getStakesAndRewards(
          client3,
          contractId,
          process.env.ACCOUNT3_ADDRESS_ETHER
        )
      );

      console.log(
        "Reward Pool after claiming:",
        await getRewardPool(client, contractId)
      );
    } catch (error) {
      console.error("Error claiming rewards:", error);
    }

    // Step 7: Account 1 unstakes 4000 MST
    console.log("Account 1 unstaking 4000 MST...");
    try {
      const unstakeTx1 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "unstakeTokens",
          new ContractFunctionParameters().addUint64(4000)
        )
        .setMaxTransactionFee(new Hbar(20));
      const unstakeTxSubmit1 = await unstakeTx1.execute(client1);
      const unstakeTxReceipt1 = await unstakeTxSubmit1.getReceipt(client1);
      console.log(
        `- Tokens unstaked by Account 1 using unstakeTokens function: ${unstakeTxReceipt1.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during unstaking of 4000 MST by Account 1 using unstakeTokens function:",
        error
      );
    }

    // Step 8: Account 2 unstakes 4000 MST
    console.log("Account 2 unstaking 4000 MST...");
    try {
      const unstakeTx2 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "unstakeTokens",
          new ContractFunctionParameters().addUint64(4000)
        )
        .setMaxTransactionFee(new Hbar(20));
      const unstakeTxSubmit2 = await unstakeTx2.execute(client2);
      const unstakeTxReceipt2 = await unstakeTxSubmit2.getReceipt(client2);
      console.log(
        `- Tokens unstaked by Account 2 using unstakeTokens function: ${unstakeTxReceipt2.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during unstaking of 4000 MST by Account 2 using unstakeTokens function:",
        error
      );
    }

    // Step 9: Account 3 unstakes 4000 MST
    console.log("Account 3 unstaking 4000 MST...");
    try {
      const unstakeTx3 = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "unstakeTokens",
          new ContractFunctionParameters().addUint64(4000)
        )
        .setMaxTransactionFee(new Hbar(20));
      const unstakeTxSubmit3 = await unstakeTx3.execute(client3);
      const unstakeTxReceipt3 = await unstakeTxSubmit3.getReceipt(client3);
      console.log(
        `- Tokens unstaked by Account 3 using unstakeTokens function: ${unstakeTxReceipt3.status.toString()}`
      );
      await delay(5000); // 5-second delay
    } catch (error) {
      console.error(
        "Error during unstaking of 4000 MST by Account 3 using unstakeTokens function:",
        error
      );
    }

    console.log("Balances after all transactions:");
    try {
      console.log(
        `Account 1 MST: ${await getTokenBalance(
          process.env.ACCOUNT1_ID,
          process.env.MST_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 1 MPT: ${await getTokenBalance(
          process.env.ACCOUNT1_ID,
          process.env.MPT_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 2 MST: ${await getTokenBalance(
          process.env.ACCOUNT2_ID,
          process.env.MST_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 2 MPT: ${await getTokenBalance(
          process.env.ACCOUNT2_ID,
          process.env.MPT_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 3 MST: ${await getTokenBalance(
          process.env.ACCOUNT3_ID,
          process.env.MST_TOKEN_ADDRESS
        )}`
      );
      console.log(
        `Account 3 MPT: ${await getTokenBalance(
          process.env.ACCOUNT3_ID,
          process.env.MPT_TOKEN_ADDRESS
        )}`
      );
    } catch (error) {
      console.error("Error logging balances after all transactions:", error);
    }

    console.log("Reward Pool:", await getRewardPool(client, contractId));

    console.log("All transactions executed successfully.");
  } catch (error) {
    console.error("Error during contract interaction:", error);
  }
}

main().catch(console.error);
