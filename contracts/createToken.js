console.clear();
require("dotenv").config();
const {
  Client,
  CustomFractionalFee,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  TokenInfoQuery,
} = require("@hashgraph/sdk");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.ACCOUNT_PRIVATE_KEY);
const treasuryId = operatorId;
const treasuryKey = operatorKey;

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();

async function main() {
  try {
    // Ensure required environment variables are available
    if (!process.env.ACCOUNT_ID || !process.env.ACCOUNT_PRIVATE_KEY) {
      throw new Error("Please set required keys in .env file.");
    }

    // Create Mintable Staking Token (MST) without any fee
    console.log(`Creating Mintable Staking Token (MST) without any fee...`);
    let mstTokenCreateTx = await new TokenCreateTransaction()
      .setTokenType(TokenType.FungibleCommon)
      .setTokenName("Mintable Staking Token")
      .setTokenSymbol("MST")
      .setDecimals(4)
      .setInitialSupply(10_000)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .setAdminKey(operatorKey)
      .freezeWith(client);

    // Sign the MST token creation transaction
    let mstTokenCreateTxSigned = await mstTokenCreateTx.sign(treasuryKey);

    // Submit the MST token creation transaction
    let mstTokenCreateTxSubmitted = await mstTokenCreateTxSigned.execute(
      client
    );

    // Get the receipt of the MST token creation transaction
    let mstTokenCreateTxReceipt = await mstTokenCreateTxSubmitted.getReceipt(
      client
    );

    // Get the MST token ID
    let mstTokenId = mstTokenCreateTxReceipt.tokenId.toString();
    console.log(`- Created MST token with ID: ${mstTokenId}`);

    // Query the MST token info
    try {
      const mstTokenInfo = await new TokenInfoQuery()
        .setTokenId(mstTokenId)
        .execute(client);
      console.log(
        `The token info for MST is: ${JSON.stringify(mstTokenInfo, null, 2)}`
      );
    } catch (mstTokenInfoError) {
      console.error(`Error querying token info for MST:`, mstTokenInfoError);
    }

    // Create Mintable Payment Token (MPT) with a 1% fee
    console.log(`Creating Mintable Payment Token (MPT) with a 10% fee...`);
    const customFee = new CustomFractionalFee()
      .setNumerator(1)
      .setDenominator(10)
      .setFeeCollectorAccountId(treasuryId);

    let mptTokenCreateTx = await new TokenCreateTransaction()
      .setTokenType(TokenType.FungibleCommon)
      .setTokenName("Mintable Payment Token")
      .setTokenSymbol("MPT")
      .setDecimals(4)
      .setInitialSupply(10_000)
      .setCustomFees([customFee])
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .setAdminKey(operatorKey)
      .freezeWith(client);

    // Sign the MPT token creation transaction
    let mptTokenCreateTxSigned = await mptTokenCreateTx.sign(treasuryKey);

    // Submit the MPT token creation transaction
    let mptTokenCreateTxSubmitted = await mptTokenCreateTxSigned.execute(
      client
    );

    // Get the receipt of the MPT token creation transaction
    let mptTokenCreateTxReceipt = await mptTokenCreateTxSubmitted.getReceipt(
      client
    );

    // Get the MPT token ID
    let mptTokenId = mptTokenCreateTxReceipt.tokenId.toString();
    console.log(`- Created MPT token with ID: ${mptTokenId}`);

    // Query the MPT token info
    try {
      const mptTokenInfo = await new TokenInfoQuery()
        .setTokenId(mptTokenId)
        .execute(client);
      console.log(
        `The token info for MPT is: ${JSON.stringify(mptTokenInfo, null, 2)}`
      );
    } catch (mptTokenInfoError) {
      console.error(`Error querying token info for MPT:`, mptTokenInfoError);
    }

    // URLs for tokens
    const mstTokenUrl = `https://hashscan.io/testnet/token/${mstTokenId}`;
    const mptTokenUrl = `https://hashscan.io/testnet/token/${mptTokenId}`;

    console.log(`MST Token URL: ${mstTokenUrl}`);
    console.log(`MPT Token URL: ${mptTokenUrl}`);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the main function
main();
