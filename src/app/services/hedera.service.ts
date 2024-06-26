import { Injectable, inject } from '@angular/core';
import {
  AccountId,
  PrivateKey,
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TokenMintTransaction,
} from '@hashgraph/sdk';
import axios from 'axios';
import { DataBaseService } from './dataBase.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HederaService {
  baseUrl = 'https://testnet.mirrornode.hedera.com/api/v1';
  private dbService = inject(DataBaseService);

  async queryMirrorNodeFor(url: string): Promise<any> {
    console.log(`Fetching data from URL: ${url}`);
    const response = await axios.get(url);
    return response.data;
  }

  async fetchEtherAddress(accountId: string): Promise<string | null> {
    console.log(`Fetching EVM address for account: ${accountId}`);
    const url = `${this.baseUrl}/accounts/${accountId}?limit=2&order=asc&transactiontype=cryptotransfer&transactions=true`;
    const accountInfo = await this.queryMirrorNodeFor(url);
    console.log('Account info fetched:', accountInfo);

    if (accountInfo && accountInfo.evm_address) {
      return accountInfo.evm_address;
    }

    console.log('No EVM address found for the given account.');
    return null;
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
  ): Promise<string> {
    try {
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
      return receipt.status.toString();
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  async executeContractFunction(
    accountId: string,
    privateKey: string,
    contractId: string,
    functionName: string,
    parameters: ContractFunctionParameters
  ): Promise<number> {
    try {
      console.log(`Executing contract function: ${functionName}`);
      const operatorId = AccountId.fromString(accountId);
      const operatorKey = PrivateKey.fromStringECDSA(privateKey);
      const client = Client.forTestnet().setOperator(operatorId, operatorKey);

      const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(functionName, parameters)
        .setMaxTransactionFee(new Hbar(20))
        .freezeWith(client);

      const signTx = await transaction.sign(operatorKey);
      const txResponse = await signTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() !== 'SUCCESS') {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }

      console.log(`Executed ${functionName} successfully.`);
      return receipt.status.toString() === 'SUCCESS' ? 1 : 0;
    } catch (error) {
      console.error(
        `Error executing contract function ${functionName}:`,
        error
      );
      return 0;
    }
  }
  async stakeTokens(
    accountId: string,
    privateKey: string,
    contractId: string,
    amount: number
  ): Promise<string> {
    try {
      console.log(`Staking ${amount} MST tokens for account: ${accountId}`);
      const parameters = new ContractFunctionParameters().addUint64(amount);
      const receiptStatus = await this.executeContractFunction(
        accountId,
        privateKey,
        contractId,
        'stakeTokens',
        parameters
      );
      console.log(`Staked ${amount} MST tokens successfully.`);
      return receiptStatus === 1 ? 'SUCCESS' : 'ERROR'; // Return success or error status
    } catch (error) {
      console.error('Error staking tokens:', error);
      return 'ERROR'; // Return error status
    }
  }

  async unstakeTokens(
    accountId: string,
    privateKey: string,
    contractId: string,
    amount: number
  ): Promise<string> {
    try {
      console.log(`Unstaking ${amount} MST tokens for account: ${accountId}`);
      const parameters = new ContractFunctionParameters().addUint64(amount);
      const receiptStatus = await this.executeContractFunction(
        accountId,
        privateKey,
        contractId,
        'unstakeTokens',
        parameters
      );
      console.log(`Unstaked ${amount} MST tokens successfully.`);
      return receiptStatus === 1 ? 'SUCCESS' : 'ERROR'; // Return success or error status
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      return 'ERROR'; // Return error status
    }
  }

  async unstakeAllTokens(
    accountId: string,
    privateKey: string,
    contractId: string
  ): Promise<string> {
    try {
      console.log(`Unstaking all tokens for account: ${accountId}`);
      const parameters = new ContractFunctionParameters();
      const receiptStatus = await this.executeContractFunction(
        accountId,
        privateKey,
        contractId,
        'unstakeAllTokens',
        parameters
      );
      console.log(`Unstaked all tokens successfully.`);
      return receiptStatus === 1 ? 'SUCCESS' : 'ERROR'; // Return success or error status
    } catch (error) {
      console.error('Error unstaking all tokens:', error);
      return 'ERROR'; // Return error status
    }
  }

  async claimRewards(
    accountId: string,
    privateKey: string,
    contractId: string
  ): Promise<string> {
    try {
      console.log(`Claiming rewards for account: ${accountId}`);
      const parameters = new ContractFunctionParameters();
      const receiptStatus = await this.executeContractFunction(
        accountId,
        privateKey,
        contractId,
        'claimRewards',
        parameters
      );
      console.log(`Claimed rewards successfully.`);
      return receiptStatus === 1 ? 'SUCCESS' : 'ERROR'; // Return success or error status
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return 'ERROR'; // Return error status
    }
  }

  async transferMstTokens(
    accountId: string,
    privateKey: string,
    contractId: string,
    recipientAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const recipientAccountIdEvm = await this.fetchEtherAddress(
        recipientAddress
      );
      console.log(`Transferring ${amount} MST tokens to ${recipientAddress}`);
      const parameters = new ContractFunctionParameters()
        .addUint64(amount)
        .addAddress(recipientAccountIdEvm);
      const receiptStatus = await this.executeContractFunction(
        accountId,
        privateKey,
        contractId,
        'transferMstTokens',
        parameters
      );
      console.log(`Transferred ${amount} MST tokens successfully.`);
      return receiptStatus === 1 ? 'SUCCESS' : 'ERROR';
    } catch (error) {
      console.error('Error transferring MST tokens:', error);
      return 'ERROR';
    }
  }

  async transferMptTokens(
    accountId: string,
    privateKey: string,
    contractId: string,
    recipientAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const recipientAccountIdEvm = await this.fetchEtherAddress(
        recipientAddress
      );
      console.log(`Transferring ${amount} MPT tokens to ${recipientAddress}`);
      const parameters = new ContractFunctionParameters()
        .addUint64(amount)
        .addAddress(recipientAccountIdEvm);
      const receiptStatus = await this.executeContractFunction(
        accountId,
        privateKey,
        contractId,
        'transferMptTokens',
        parameters
      );
      console.log(`Transferred ${amount} MPT tokens successfully.`);
      return receiptStatus === 1 ? 'SUCCESS' : 'ERROR';
    } catch (error) {
      console.error('Error transferring MPT tokens:', error);
      return 'ERROR';
    }
  }

  async getStakes(
    accountId: string,
    privateKey: string,
    contractId: string
  ): Promise<number> {
    try {
      const accountEvm = await this.fetchEtherAddress(accountId);
      const client = Client.forTestnet().setOperator(
        AccountId.fromString(accountId),
        PrivateKey.fromStringECDSA(privateKey)
      );

      const stakesQuery = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          'getStakes',
          new ContractFunctionParameters().addAddress(accountEvm)
        );
      const stakesTransactionId = await stakesQuery.execute(client);
      const stakesRecord = await stakesTransactionId.getRecord(client);
      const stakesContractFunctionResult = stakesRecord.contractFunctionResult;
      const stakes = stakesContractFunctionResult.getUint64(0).toString();

      return Number(stakes);
    } catch (error) {
      console.error(`Error getting stakes for account ${accountId}:`, error);
      return 0;
    }
  }

  async getRewards(
    accountId: string,
    privateKey: string,
    contractId: string
  ): Promise<number> {
    try {
      const client = Client.forTestnet().setOperator(
        AccountId.fromString(accountId),
        PrivateKey.fromStringECDSA(privateKey)
      );

      const rewardsQuery = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction('getMyReward', new ContractFunctionParameters());
      const rewardsTransactionId = await rewardsQuery.execute(client);
      const rewardsRecord = await rewardsTransactionId.getRecord(client);
      const rewardsContractFunctionResult =
        rewardsRecord.contractFunctionResult;
      const rewards = rewardsContractFunctionResult.getUint64(0).toString();

      return Number(rewards);
    } catch (error) {
      console.error(`Error getting rewards for account ${accountId}:`, error);
      return 0;
    }
  }


}
