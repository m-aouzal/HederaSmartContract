import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class HederaService {
  private baseUrl = 'https://testnet.mirrornode.hedera.com/api/v1';

  constructor() {}

  private async queryMirrorNodeFor(url: string) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error querying mirror node: ${error}`);
      return null;
    }
  }
  async getTokenBalance(
    accountId: string,
    tokenId: string
  ): Promise<number | null> {
    console.log(
      `Fetching balance for account: ${accountId} and token: ${tokenId}`
    );

    const url = `${this.baseUrl}/balances?account.id=${accountId}`;
    console.log(`Fetching balance info from URL: ${url}`);

    const balance1Info = await this.queryMirrorNodeFor(url);
    const balanceInfo = await this.queryMirrorNodeFor(url);
    console.log('Balance info fetched:', balanceInfo);

    if (balanceInfo && balanceInfo.balances) {
      for (const item of balanceInfo.balances) {
        if (item.account === accountId) {
          for (const token of item.tokens) {
            if (token.token_id === tokenId) {
              const tokenInfoUrl = `${this.baseUrl}/tokens/${tokenId}`;
              console.log(`Fetching token info from URL: ${tokenInfoUrl}`);

              const tokenInfo = await this.queryMirrorNodeFor(tokenInfoUrl);
              console.log('Token info fetched:', tokenInfo);

              if (tokenInfo && tokenInfo.decimals !== undefined) {
                const decimals = parseFloat(tokenInfo.decimals);
                const balance = token.balance / 10 ** decimals;
                console.log(`Computed balance: ${balance * 10000}`);
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
}
