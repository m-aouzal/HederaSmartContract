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
  staked: number = 0;
  recipientAccountId: string = '';
  transactionAmount: number = 0;
  stakeAmount: number = 0;
  unstakeAmount: number = 0;
  accountId: string = '';
  privateKey: string = '';
  mstTokenId: string = '';
  mptTokenId: string = '';
  contractId: string = '0.0.4396021'; // replace with actual contract ID
  transactionSpinner: boolean = false;
  stakeSpinner: boolean = false;
  unstakeSpinner: boolean = false;
  claimSpinner: boolean = false;
  transactionError: string = '';
  stakeError: string = '';
  unstakeError: string = '';
  claimError: string = '';

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
      const { stakes, rewards } = await this.hederaService.getStakesAndRewards(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      this.staked = stakes;
      this.rewards = rewards;
      console.log(`Stakes: ${this.staked}, Rewards: ${this.rewards}`);
    } catch (error) {
      console.error('Error fetching stakes and rewards:', error);
    }
  }

  async stakeTokens() {
    console.log(
      `Staking ${this.stakeAmount} MST tokens for account: ${this.accountId}`
    );
    this.stakeError = '';
    this.stakeSpinner = true;
    try {
      if (this.mstBalance < this.stakeAmount) {
        this.stakeError = `Insufficient balance. Maximum stakable amount: ${this.mstBalance}`;
        this.stakeSpinner = false;
        return;
      }
      const receiptStatus = await this.hederaService.stakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.stakeAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));
      this.getBalances();
      this.getStakesAndRewards();
      if (receiptStatus === 'SUCCESS') {
        alert(`Staked ${this.stakeAmount} MST tokens successfully.`);
      } else {
        this.stakeError = `Staking failed. Status: ${receiptStatus}`;
      }
    } catch (error) {
      console.error('Error staking tokens:', error);
      const errorMessage = error.message.split('at')[0].trim();
      this.stakeError = `Error staking tokens. ${errorMessage}`;
    } finally {
      this.stakeSpinner = false;
      this.stakeAmount = 0;
    }
  }

  async unstakeTokens() {
    console.log(
      `Unstaking ${this.unstakeAmount} MST tokens for account: ${this.accountId}`
    );
    this.unstakeError = '';
    this.unstakeSpinner = true;
    try {
      if (this.staked < this.unstakeAmount) {
        this.unstakeError = `Insufficient staked balance. Maximum unstakable amount: ${this.staked}`;
        this.unstakeSpinner = false;
        return;
      }
      const receiptStatus = await this.hederaService.unstakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.unstakeAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));
      this.getBalances();
      this.getStakesAndRewards();
      if (receiptStatus === 'SUCCESS') {
        alert(`Unstaked ${this.unstakeAmount} MST tokens successfully.`);
      } else {
        this.unstakeError = `Unstaking failed. Status: ${receiptStatus}`;
      }
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      const errorMessage = error.message.split('at')[0].trim();
      this.unstakeError = `Error unstaking tokens. ${errorMessage}`;
    } finally {
      this.unstakeSpinner = false;
      this.unstakeAmount = 0;
    }
  }

  async claimRewards() {
    console.log(`Claiming rewards for account: ${this.accountId}`);
    this.claimError = '';
    this.claimSpinner = true;
    try {
      if (this.staked === 0) {
        this.claimError = 'You must have staked tokens to claim rewards.';
        this.claimSpinner = false;
        return;
      }
      const receiptStatus = await this.hederaService.claimRewards(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));
      this.getBalances();
      this.getStakesAndRewards();
      if (receiptStatus === 'SUCCESS') {
        alert(`Claimed rewards successfully.`);
      } else {
        this.claimError = `Claiming rewards failed. Status: ${receiptStatus}`;
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      const errorMessage = error.message.split('at')[0].trim();
      this.claimError = `Error claiming rewards. ${errorMessage}`;
    } finally {
      this.claimSpinner = false;
    }
  }

  async sendTransaction() {
    console.log(
      `Sending ${this.transactionAmount} MPT tokens to ${this.recipientAccountId}`
    );
    this.transactionError = '';
    this.transactionSpinner = true;
    try {
      const receiptStatus = await this.hederaService.transferMptTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.recipientAccountId,
        this.transactionAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));
      this.getBalances();
      if (receiptStatus === 'SUCCESS') {
        alert(`Transferred ${this.transactionAmount} MPT tokens successfully.`);
      } else {
        this.transactionError = `Transfer failed. Status: ${receiptStatus}`;
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      const errorMessage = error.message.split('at')[0].trim();
      this.transactionError = `Error sending transaction. ${errorMessage}`;
    } finally {
      this.transactionSpinner = false;
      this.transactionAmount = 0;
      this.recipientAccountId = '';
    }
  }

  logout() {
    this.authService.logout();
  }
}
