import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DataBaseService } from '../services/dataBase.service';
import { HederaService } from '../services/hedera.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MyFavorites } from '../Interfaces/MyFavorites';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  claimSpinner: boolean = false;
  stakeSpinner: boolean = false;
  unstakeSpinner: boolean = false;
  sendSpinner: boolean = false;
  favoriteSpinner: boolean = false;

  showSendTokensForm: boolean = false;
  showStakeTokensForm: boolean = false;
  showUnstakeTokensForm: boolean = false;
  showClaimRewardsForm: boolean = false;
  showFavorites: boolean = false;
  showAddFavoriteForm: boolean = false;

  favoriteForm: FormGroup;
  transferForm: FormGroup;
  favorites: MyFavorites[] = [];
  useAlias: boolean = false;

  accountIdValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = /^0\.0\.[0-9]{7}$/.test(control.value);
      return valid ? null : { invalidAccountId: true };
    };
  }

  constructor(
    private authService: AuthService,
    private hederaService: HederaService,
    private dbService: DataBaseService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getUserDetails();
    this.initializeFavoriteForm();
    this.loadFavorites();
    this.initializeTransferForm();
  }

  initializeFavoriteForm() {
    this.favoriteForm = this.fb.group({
      alias: ['', Validators.required],
      accountId: ['', [Validators.required, this.accountIdValidator()]],
    });
  }

  initializeTransferForm() {
    this.transferForm = this.fb.group({
      useAlias: [false],
      recipientAccountId: [
        '',
        [Validators.required, this.accountIdValidator()],
      ],
      transferAmount: [0, [Validators.required, Validators.min(1)]],
      tokenType: ['MST', Validators.required],
      favoriteAlias: [''],
    });

    this.transferForm.get('useAlias')?.valueChanges.subscribe((useAlias) => {
      if (useAlias) {
        this.transferForm.get('recipientAccountId')?.disable();
        this.transferForm
          .get('favoriteAlias')
          ?.setValidators([Validators.required]);
      } else {
        this.transferForm.get('recipientAccountId')?.enable();
        this.transferForm.get('favoriteAlias')?.clearValidators();
      }
      this.transferForm.get('favoriteAlias')?.updateValueAndValidity();
      this.transferForm.get('recipientAccountId')?.updateValueAndValidity();
    });
  }

  toggleForm(formType: string): void {
    this.showSendTokensForm = formType === 'sendTokens';
    this.showStakeTokensForm = formType === 'stakeTokens';
    this.showUnstakeTokensForm = formType === 'unstakeTokens';
    this.showClaimRewardsForm = formType === 'claimRewards';
    this.showFavorites = formType === 'favorites';
    this.showAddFavoriteForm = formType === 'addFavorite';
  }

  addFavorite() {
    if (this.favoriteForm.valid) {
      const user = this.authService.currentUserSig();
      const favorite: MyFavorites = {
        id: '',
        registerer: user.email,
        accountId: this.favoriteForm.value.accountId,
        alias: this.favoriteForm.value.alias,
      };

      this.favoriteSpinner = true;

      this.dbService.addFavorite(favorite).subscribe({
        next: (id) => {
          console.log('Favorite added with ID:', id);
          alert('Favorite added successfully.');
          this.favoriteForm.reset();
          this.toggleForm('favorites'); // Switch to favorites view after adding
          this.loadFavorites(); // Reload favorites after adding a new one
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          alert('Error adding favorite.');
        },
        complete: () => {
          this.favoriteSpinner = false;
        },
      });
    }
  }

  removeFavorite(favoriteId: string) {
    this.dbService.removeFavorite(favoriteId).subscribe({
      next: () => {
        console.log('Favorite removed:', favoriteId);
        this.loadFavorites();
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
        alert('Error removing favorite.');
      },
    });
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
          this.getStakes();
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

  loadFavorites() {
    const user = this.authService.currentUserSig();
    if (user && user.email) {
      this.dbService.getMyFavorites(user.email).subscribe((favorites) => {
        this.favorites = favorites;
        console.log('Favorites loaded:', this.favorites);
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
        Math.floor(
          await this.hederaService.getTokenBalance(
            this.accountId,
            this.mstTokenId
          )
        ) || 0;
      this.mptBalance =
        Math.floor(
          await this.hederaService.getTokenBalance(
            this.accountId,
            this.mptTokenId
          )
        ) || 0;
      console.log(
        `MST Balance: ${this.mstBalance}, MPT Balance: ${this.mptBalance}`
      );
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }

  async getStakes() {
    try {
      const stakes = await this.hederaService.getStakes(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      this.stakes = stakes;
      console.log(`Stakes: ${stakes}`);
    } catch (error) {
      console.error('Error fetching stakes:', error);
    }
  }

  async getRewards() {
    try {
      const rewards = await this.hederaService.getRewards(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      this.rewards = rewards;
      console.log(`Rewards: ${rewards}`);
    } catch (error) {
      console.error('Error fetching rewards:', error);
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
      let rewardMessage = '';
      if (this.stakes > 0) {
        await this.getRewards();
        console.log(`Rewards: ${this.rewards}`);
        rewardMessage = ` You collected ${this.rewards} MPT tokens.`;
      }
      const receiptStatus = await this.hederaService.stakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.stakeAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));

      if (receiptStatus === 'SUCCESS') {
        alert(
          `Staked ${this.stakeAmount} MST tokens successfully.${rewardMessage}`
        );
      } else {
        alert(`Staking ${this.stakeAmount} MST tokens failed.`);
      }

      await this.getBalances();
      await this.getStakes();
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
      let rewardMessage = '';

      await this.getRewards();

      const receiptStatus = await this.hederaService.unstakeTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        this.unstakeAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));
      if (receiptStatus === 'SUCCESS') {
        alert(
          `Unstaked ${this.unstakeAmount} MST tokens successfully and you ve collected You collected ${this.rewards} MPT tokens.`
        );
      } else {
        alert(`Unstaking ${this.unstakeAmount} MST tokens failed.`);
      }

      await this.getBalances();
      await this.getStakes();
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
      await this.getRewards();
      const receiptStatus = await this.hederaService.unstakeAllTokens(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      await new Promise((resolve) => setTimeout(resolve, 3500)); // 5-second delay

      if (receiptStatus === 'SUCCESS') {
        alert(
          `Unstaked all tokens successfully. You collected ${this.rewards} MPT tokens.`
        );
      } else {
        alert(`Unstaking all tokens failed.`);
      }

      await this.getBalances();
      await this.getStakes();
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
      await this.getRewards();
      const receiptStatus = await this.hederaService.claimRewards(
        this.accountId,
        this.privateKey,
        this.contractId
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));
      if (receiptStatus === 'SUCCESS') {
        alert(
          `Congratulations! You have collected ${this.rewards} MPT tokens.`
        );
      } else {
        alert(`Claiming rewards failed.`);
      }

      await this.getBalances();
      await this.getStakes();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      const errorMessage = error.message.split('at')[0].trim();
      alert(`Error claiming rewards. ${errorMessage}`);
    } finally {
      this.claimSpinner = false;
    }
  }

  async sendTransaction() {
    if (this.transferForm.value.transferAmount > this.mptBalance) {
      alert(
        `Insufficient balance. Maximum transferable amount: ${this.mptBalance}`
      );
      return;
    }
    this.sendSpinner = true; // Show spinner
    try {
      let recipientAccountId = this.transferForm.value.recipientAccountId;
      let transferAmount = this.transferForm.value.transferAmount;

      if (this.useAlias) {
        const favoriteAlias = this.transferForm.value.favoriteAlias;
        const favorite = this.favorites.find(
          (fav) => fav.alias === favoriteAlias
        );
        if (favorite) {
          recipientAccountId = favorite.accountId;
        } else {
          alert('Selected alias does not exist.');
          this.sendSpinner = false;
          return;
        }
      }
      console.log('Recipient Account ID:', recipientAccountId);
      console.log('Transfer Amount:', transferAmount);

      const etherAddress = await this.hederaService.fetchEtherAddress(
        recipientAccountId
      );
      const receiptStatus = await this.hederaService.transferMptTokens(
        this.accountId,
        this.privateKey,
        this.contractId,
        etherAddress,
        transferAmount
      );
      await new Promise((resolve) => setTimeout(resolve, 3500));
      if (receiptStatus === 'SUCCESS') {
        alert(`Transaction of ${transferAmount} MPT tokens successful.`);
      } else {
        alert(`Transaction failed. Status: ${receiptStatus}`);
      }

      await this.getBalances();
    } catch (error) {
      console.error('Error sending transaction:', error);
      const errorMessage = error.message.split('at')[0].trim();
      alert(`Error sending transaction. ${errorMessage}`);
    } finally {
      this.sendSpinner = false; // Hide spinner
      this.transferForm.reset(); // Reset form values
      this.transferForm.get('useAlias')?.setValue(false);
      this.transferForm.get('transferAmount')?.setValue(0);
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Copied to clipboard:', text);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  }

  logout() {
    this.authService.logout();
  }
}
