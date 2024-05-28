import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataBaseService } from '../services/dataBase.service';
import { HederaService } from '../services/hedera.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  mstBalance: number = 0;
  mptBalance: number = 0;
  rewards: number = 0;
  recipientAccountId: string = '';
  transactionAmount: number = 0;
  stakeAmount: number = 0;
  unstakeAmount: number = 0;
  accountId: string = '';
  privateKey: string = '';
  mstTokenId: string = '';
  mptTokenId: string = '';
  contractId: string = '0.0.4396021'; // replace with actual contract ID

  constructor(
    private authService: AuthService,
    private hederaService: HederaService,
    private dbService: DataBaseService
  ) {}

  ngOnInit() {
    this.getUserDetails();
  }

  async getUserDetails() {
    const user = this.authService.currentUserSig();
    if (user && user.email) {
      console.log(`Fetching account details for email: ${user.email}`);
      this.dbService.getAccountByEmail(user.email).subscribe((accounts) => {
        if (accounts.length > 0) {
          const account = accounts[0];
          this.accountId = account.accountId;
          this.privateKey = account.accountPrivateKey;
          console.log(
            `Account ID: ${this.accountId}, Private Key: ${this.privateKey}`
          );
          this.getBalances();
          this.getStakesAndRewards();
        } else {
          console.log('No account found for the given email.');
        }
      });

      this.dbService.getTokens().subscribe((tokens) => {
        console.log('Tokens fetched:', tokens);
        const mstToken = tokens.find((token) => token.tokenSymbol === 'MST');
        const mptToken = tokens.find((token) => token.tokenSymbol === 'MPT');

        if (mstToken) {
          this.mstTokenId = mstToken.tokenId;
          console.log(`MST Token ID: ${this.mstTokenId}`);
        } else {
          console.log('No MST token found.');
        }

        if (mptToken) {
          this.mptTokenId = mptToken.tokenId;
          console.log(`MPT Token ID: ${this.mptTokenId}`);
        } else {
          console.log('No MPT token found.');
        }
      });
    }
  }

  async getBalances() {
    try {
      this.mptBalance =
        (await this.hederaService.getTokenBalance(
          this.accountId,
          this.mptTokenId
        )) || 0;
      this.mstBalance =
        (await this.hederaService.getTokenBalance(
          this.accountId,
          this.mstTokenId
        )) || 0;
      this.mptBalance =
        (await this.hederaService.getTokenBalance(
          this.accountId,
          this.mptTokenId
        )) || 0;
      console.log(
        `MST Balance: ${this.mstBalance}, MPT Balance: ${this.mptBalance}`
      );
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }

  async getStakesAndRewards() {
    try {
      const stakes = await this.hederaService.getStakes(
        this.accountId,
        this.contractId
      );
      const rewards = await this.hederaService.getRewards(
        this.accountId,
        this.contractId
      );
      console.log(`Stakes: ${stakes}, Rewards: ${rewards}`);
    } catch (error) {
      console.error('Error fetching stakes and rewards:', error);
    }
  }

  async stakeTokens() {
    console.log(
      `Staking ${this.stakeAmount} MST tokens for account: ${this.accountId}`
    );
    try {
      await this.hederaService.stakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.stakeAmount
      );
      console.log('Stake successful.');
      this.getBalances();
      this.getStakesAndRewards();
    } catch (error) {
      console.error('Error staking tokens:', error);
    }
  }

  async unstakeTokens() {
    console.log(
      `Unstaking ${this.unstakeAmount} MST tokens for account: ${this.accountId}`
    );
    try {
      await this.hederaService.unstakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.unstakeAmount
      );
      console.log('Unstake successful.');
      this.getBalances();
      this.getStakesAndRewards();
    } catch (error) {
      console.error('Error unstaking tokens:', error);
    }
  }

  async claimRewards() {
    console.log(`Claiming rewards for account: ${this.accountId}`);
    try {
      await this.hederaService.claimRewards(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      console.log('Rewards claimed successfully.');
      this.getBalances();
      this.getStakesAndRewards();
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  }

  async sendTransaction() {
    console.log(
      `Sending ${this.transactionAmount} MPT tokens to ${this.recipientAccountId}`
    );
    try {
      const etherAddress = await this.dbService.getEtherAddress(
        this.recipientAccountId
      );
      console.log(`Fetched Ether address: ${etherAddress}`);
      await this.hederaService.transferMptTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        etherAddress,
        this.transactionAmount
      );
      console.log('Transaction successful.');
      this.getBalances();
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  }

  logout() {
    this.authService.logout();
  }
}
