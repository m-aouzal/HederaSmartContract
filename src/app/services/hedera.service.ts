import { Injectable } from '@angular/core';
import {
  AccountId,
  PrivateKey,
  Client,
  TokenMintTransaction,
  Hbar,
} from '@hashgraph/sdk';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class HederaService {
  baseUrl = 'https://testnet.mirrornode.hedera.com/api/v1';

  constructor() {}

  async queryMirrorNodeFor(url: string): Promise<any> {
    console.log(`Fetching balance info from URL: ${url}`);
    const response = await axios.get(url);
    return response.data;
  }

  async getTokenBalance(
    accountId: string,
    tokenId: string
  ): Promise<number | null> {
    console.log(
      `Fetching balance for account: ${accountId} and token: ${tokenId}`
    );
    const url = `${this.baseUrl}/balances?account.id=${accountId}`;
    const balanceInfo = await this.queryMirrorNodeFor(url);
    console.log('Balance info fetched:', balanceInfo);

    if (balanceInfo && balanceInfo.balances) {
      for (const item of balanceInfo.balances) {
        if (item.account === accountId) {
          for (const token of item.tokens) {
            if (token.token_id === tokenId) {
              const tokenInfoUrl = `${this.baseUrl}/tokens/${tokenId}`;
              const tokenInfo = await this.queryMirrorNodeFor(tokenInfoUrl);
              console.log('Token info fetched:', tokenInfo);

              if (tokenInfo && tokenInfo.decimals !== undefined) {
                const decimals = parseFloat(tokenInfo.decimals);
                const balance = token.balance / 10 ** decimals;
                return balance * 10000; // Adjust as necessary
              }
            }
          }
        }
      }
    }
    console.log('No balance found for the given account and token.');
    return null;
  }

  async mintToken(
    accountId: string,
    privateKey: string,
    tokenId: string,
    amount: number
  ): Promise<void> {
    console.log(`Minting ${amount} tokens for token ID: ${tokenId}`);
    const operatorId = AccountId.fromString(accountId);
    const operatorKey = PrivateKey.fromStringECDSA(privateKey);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    console.log(`Client configured with Account ID: ${accountId}`);

    const transaction = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(amount)
      .setMaxTransactionFee(new Hbar(20)) // Adjust as necessary
      .freezeWith(client);

    console.log('Transaction frozen.');

    const signTx = await transaction.sign(operatorKey);
    console.log('Transaction signed.');

    const txResponse = await signTx.execute(client);
    console.log('Transaction executed.');

    const receipt = await txResponse.getReceipt(client);
    console.log('Transaction receipt fetched.');

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Token minting failed with status: ${receipt.status}`);
    }

    console.log(`Minted ${amount} tokens successfully.`);
  }
}
