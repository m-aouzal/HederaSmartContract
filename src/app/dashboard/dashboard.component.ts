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
  stakes: number = 0;
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
  claimSpinner: boolean = false; // Spinner flag for claiming rewards
  stakeSpinner: boolean = false; // Spinner flag for staking tokens
  unstakeSpinner: boolean = false; // Spinner flag for unstaking tokens
  sendSpinner: boolean = false; 

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
      this.stakes = stakes;
      this.rewards = rewards;
      console.log(`Stakes: ${stakes}, Rewards: ${rewards}`);
    } catch (error) {
      console.error('Error fetching stakes and rewards:', error);
    }
  }

  async stakeTokens() {
    if (this.stakeAmount > this.mstBalance) {
      alert(
        `Insufficient balance. Maximum stakeable amount: ${this.mstBalance}`
      );
      return;
    }
    this.stakeSpinner = true;
    try {
      const receiptStatus = await this.hederaService.stakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.stakeAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

      await this.getBalances();
      await this.getStakesAndRewards();

      if (receiptStatus === 'SUCCESS') {
        alert(`Staked ${this.stakeAmount} MST tokens successfully.`);
      } else {
        alert(`Staking ${this.stakeAmount} MST tokens failed.`);
      }
    } catch (error) {
      console.error('Error staking tokens:', error);
      const errorMessage = error.message.split('at')[0].trim();
      alert(`Error staking tokens. ${errorMessage}`);
    } finally {
      this.stakeSpinner = false;
      this.stakeAmount = 0; // Reset stake amount
    }
  }

  async unstakeTokens() {
    if (this.stakes < this.unstakeAmount) {
      alert(
        `Insufficient staked amount. Maximum unstakable amount: ${this.stakes}`
      );
      return;
    }
    this.unstakeSpinner = true;
    try {
      const receiptStatus = await this.hederaService.unstakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.unstakeAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

      await this.getBalances();
      await this.getStakesAndRewards();

      if (receiptStatus === 'SUCCESS') {
        alert(`Unstaked ${this.unstakeAmount} MST tokens successfully.`);
      } else {
        alert(`Unstaking ${this.unstakeAmount} MST tokens failed.`);
      }
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      const errorMessage = error.message.split('at')[0].trim();
      alert(`Error unstaking tokens. ${errorMessage}`);
    } finally {
      this.unstakeSpinner = false;
      this.unstakeAmount = 0; // Reset unstake amount
    }
  }

  async unstakeAllTokens() {
    if (this.stakes <= 0) {
      alert(`No tokens to unstake.`);
      return;
    }
    this.unstakeSpinner = true;
    try {
      const receiptStatus = await this.hederaService.unstakeAllTokens(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

      await this.getBalances();
      await this.getStakesAndRewards();

      if (receiptStatus === 'SUCCESS') {
        alert(`Unstaked all tokens successfully.`);
      } else {
        alert(`Unstaking all tokens failed.`);
      }
    } catch (error) {
      console.error('Error unstaking all tokens:', error);
      const errorMessage = error.message.split('at')[0].trim();
      alert(`Error unstaking all tokens. ${errorMessage}`);
    } finally {
      this.unstakeSpinner = false;
    }
  }

  async claimRewards() {
    if (this.stakes <= 0) {
      alert(`No staked tokens available for claiming rewards.`);
      return;
    }
    this.claimSpinner = true;
    try {
      const receiptStatus = await this.hederaService.claimRewards(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

      await this.getBalances();
      await this.getStakesAndRewards();

      if (receiptStatus === 'SUCCESS') {
        alert(
          `Congratulations! You have collected ${this.rewards} MPT tokens.`
        );
      } else {
        alert(`Claiming rewards failed.`);
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      const errorMessage = error.message.split('at')[0].trim();
      alert(`Error claiming rewards. ${errorMessage}`);
    } finally {
      this.claimSpinner = false;
    }
  }

  async sendTransaction() {
    if (this.transactionAmount > this.mptBalance) {
      alert(`Insufficient balance. Maximum transferable amount: ${this.mptBalance}`);
      return;
    }
    this.sendSpinner = true; // Show spinner
    try {
      const etherAddress = await this.hederaService.fetchEtherAddress(this.recipientAccountId);
      console.log(`Fetched Ether address: ${etherAddress}`);
      const receiptStatus = await this.hederaService.transferMptTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        etherAddress,
        this.transactionAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

      await this.getBalances();

      if (receiptStatus === 'SUCCESS') {
        alert(`Transaction of ${this.transactionAmount} MPT tokens successful.`);
      } else {
        alert(`Transaction failed. Status: ${receiptStatus}`);
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      const errorMessage = error.message.split('at')[0].trim();
      alert(`Error sending transaction. ${errorMessage}`);
    } finally {
      this.sendSpinner = false; // Hide spinner
      this.recipientAccountId = ''; // Reset form values
      this.transactionAmount = 0;
    }
  }

  logout() {
    this.authService.logout();
  }
}
