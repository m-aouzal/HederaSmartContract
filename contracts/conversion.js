const { AccountId } = require("@hashgraph/sdk");

// Your Hedera account ID
const hederaAccountId = AccountId.fromString("0.0.4389234");

// Convert the Hedera account ID to an Ethereum address
const ethereumAddress = hederaAccountId.toEvmAddress();

console.log(`Ethereum address: ${ethereumAddress}`);
