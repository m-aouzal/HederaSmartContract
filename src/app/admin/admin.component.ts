import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { DataBaseService } from '../services/dataBase.service';
import { HederaService } from '../services/hedera.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Account } from '../services/Account';
import { Token } from '../services/Token';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private hederaService: HederaService,
    private dbService: DataBaseService
  ) {} // Inject HederaService

  accountsService = inject(DataBaseService);
  accountForm: FormGroup;
  tokenForm: FormGroup;
  queryForm: FormGroup;
  deleteForm: FormGroup;
  transferForm: FormGroup; // Add transfer form
  mintForm: FormGroup; // Add mint form
  showForm = false;
  showTokenForm = false;
  showDeleteAccountForm = false;
  showDeleteTokenForm = false;
  showTransferForm = false; // Add show transfer form
  accounts: Account[] = [];
  tokens: Token[] = [];
  queriedAccount: Account | null = null;
  randomWord: string = '';
  deleteAccountId: string = '';
  deleteTokenId: string = '';
  mstBalance: number = 0;
  mptBalance: number = 0;
  mstTokenId: string = '';
  mptTokenId: string = '';
  accountId: string = '';
  privateKey: string = '';
  mintSpinner: boolean = false; // Add spinner flag
  transferSpinner: boolean = false;
  contractId: string = '0.0.4396021';

  accountIdValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = /^0\.0\.[0-9]{7}$/.test(control.value);
      return valid ? null : { invalidAccountId: true };
    };
  }

  ngOnInit() {
    console.log('AdminComponent initialized');
    this.loadAccounts();
    this.loadTokens();
    this.getAccountDetailsByAlias('Owner'); // Fetch account details

    this.accountForm = this.fb.group({
      accountId: ['', Validators.required],
      accountPrivateKey: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      Ether: ['', Validators.required],
      alias: ['', Validators.required],
    });

    this.tokenForm = this.fb.group({
      tokenName: ['', Validators.required],
      tokenSymbol: ['', Validators.required],
      tokenId: ['', Validators.required],
    });

    this.queryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.deleteForm = this.fb.group({
      securityWord: ['', Validators.required],
    });

    this.transferForm = this.fb.group({
      recipientAccountId: [
        '',
        [Validators.required, this.accountIdValidator()],
      ],
      transferAmount: [0, [Validators.required, Validators.min(1)]],
      tokenType: ['MST', Validators.required],
    });

    this.mintForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      tokenType: ['MST', Validators.required],
    });
  }

  async getAccountDetailsByAlias(alias: string) {
    console.log(`Fetching account details for alias: ${alias}`);
    this.accountsService.getAccounts().subscribe((accounts) => {
      console.log('Accounts fetched:', accounts);

      const account = accounts.find((acc) => acc.alias === alias);
      if (account) {
        this.accountId = account.accountId;
        this.privateKey = account.accountPrivateKey;
        console.log(
          `Account ID: ${this.accountId}, Private Key: ${this.privateKey}`
        );
        this.getBalances();
      } else {
        console.log('No account found for the given alias.');
      }
    });

    this.accountsService.getTokens().subscribe((tokens) => {
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

  async getBalances() {
    console.log('Fetching token balances...');
    try {
      await this.getMstBalance();
      await this.getMstBalance();
      await this.getMptBalance();
      console.log(
        `MST Balance: ${Math.floor(this.mstBalance)}, MPT Balance: ${Math.floor(this.mptBalance)}`
      );
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }

  async getMstBalance() {
    console.log('Fetching MST balance...');
    try {
      console.log(
        `Fetching MST balance for account: ${this.accountId} and token: ${this.mstTokenId}`
      );
      this.mstBalance =
        (await this.hederaService.getTokenBalance(
          this.accountId,
          this.mstTokenId
        )) || 0;
      console.log(`Fetched MST Balance: ${this.mstBalance}`);
    } catch (error) {
      console.error('Error fetching MST balance:', error);
    }
  }

  async getMptBalance() {
    console.log('Fetching MPT balance...');
    try {
      console.log(
        `Fetching MPT balance for account: ${this.accountId} and token: ${this.mptTokenId}`
      );
      this.mptBalance =
        (await this.hederaService.getTokenBalance(
          this.accountId,
          this.mptTokenId
        )) || 0;
      console.log(`Fetched MPT Balance: ${this.mptBalance}`);
    } catch (error) {
      console.error('Error fetching MPT balance:', error);
    }
  }

  async mintTokens() {
    if (this.mintForm.valid) {
      const { amount, tokenType } = this.mintForm.value;
      this.mintSpinner = true; // Show spinner
      try {
        const tokenId = tokenType === 'MST' ? this.mstTokenId : this.mptTokenId;
        const receiptStatus = await this.hederaService.mintToken(
          this.accountId,
          this.privateKey,
          tokenId,
          amount
        );

        await new Promise((resolve) => setTimeout(resolve, 3500));

        if (tokenType === 'MST') {
          await this.getMstBalance(); // Refresh MST balance
        } else {
          await this.getMptBalance(); // Refresh MPT balance
        }

        if (receiptStatus === 'SUCCESS') {
          alert(`Minting of ${amount} ${tokenType} tokens was successful.`);
        } else {
          alert(
            `Minting of ${amount} ${tokenType} tokens failed. Status: ${receiptStatus}`
          );
        }
      } catch (error) {
        console.error(`Error minting ${tokenType} tokens:`, error);
        const errorMessage = error.message.split('at')[0].trim();
        alert(`Error minting ${tokenType} tokens. ${errorMessage}`);
      } finally {
        this.mintSpinner = false; // Hide spinner
        this.mintForm.reset({
          amount: 0,
          tokenType: 'MST',
        }); // Clear the form with default values
      }
    }
  }
  async transferTokens() {
    if (this.transferForm.valid) {
      const { recipientAccountId, transferAmount, tokenType } =
        this.transferForm.value;
      const currentBalance =
        tokenType === 'MST' ? this.mstBalance : this.mptBalance;

      if (currentBalance < transferAmount) {
        alert(
          `Insufficient balance. Maximum transferable amount: ${currentBalance}`
        );
        this.transferSpinner = false;
        return;
      }

      this.transferSpinner = true; // Show spinner
      try {
       
        let receiptStatus;
        if (tokenType === 'MST') {
          receiptStatus = await this.hederaService.transferMstTokens(
            this.accountId,
            this.privateKey,
            this.contractId,
            recipientAccountId,
            transferAmount
          );
        } else {
          receiptStatus = await this.hederaService.transferMptTokens(
            this.accountId,
            this.privateKey,
            this.contractId,
            recipientAccountId,
            transferAmount
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 3500));
        await this.getBalances(); // Refresh balances

        if (receiptStatus === 'SUCCESS') {
          alert(
            `Transfer of ${transferAmount} ${tokenType} tokens was successful.`
          );
        } else {
          alert(
            `Transfer of ${transferAmount} ${tokenType} tokens failed. Status: ${receiptStatus}`
          );
        }
      } catch (error) {
        console.error(`Error transferring ${tokenType} tokens:`, error);
        const errorMessage = error.message.split('at')[0].trim();
        alert(`Error transferring ${tokenType} tokens. ${errorMessage}`);
      } finally {
        this.transferSpinner = false; // Hide spinner
        this.transferForm.reset({
          recipientAccountId: '',
          transferAmount: 0,
          tokenType: 'MPT',
        }); // Clear the form with default values
      }
    }
  }

  generateRandomWord() {
    const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    this.randomWord = words[Math.floor(Math.random() * words.length)];
    console.log(`Generated random word: ${this.randomWord}`);
  }

  validateSecurityWord(inputWord: string): boolean {
    const isValid = inputWord === this.randomWord;
    console.log(`Security word validation result: ${isValid}`);
    return isValid;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    console.log(`Show form toggled: ${this.showForm}`);
  }

  toggleTokenForm() {
    this.showTokenForm = !this.showTokenForm;
    console.log(`Show token form toggled: ${this.showTokenForm}`);
  }

  toggleTransferForm() {
    this.showTransferForm = !this.showTransferForm;
    console.log(`Show transfer form toggled: ${this.showTransferForm}`);
  }

  addAccount() {
    if (this.accountForm.valid) {
      const account: Account = this.accountForm.value;
      this.accountsService.addAccount(account).subscribe((id) => {
        console.log('Account added with ID:', id);
        this.accountForm.reset();
        this.showForm = false;
        this.loadAccounts(); // Assuming you have a method to load accounts
      });
    }
  }

  queryAccount() {
    if (this.queryForm.valid) {
      const email = this.queryForm.value.email;
      console.log(`Querying account with email: ${email}`);
      this.accountsService.getAccountByEmail(email).subscribe((accounts) => {
        this.queriedAccount = accounts.length > 0 ? accounts[0] : null;
        console.log('Queried account:', this.queriedAccount);
      });
    }
  }

  async loadAccounts() {
    console.log('Loading accounts...');
    this.accountsService.getAccounts().subscribe((accounts) => {
      this.accounts = accounts;
      console.log('Accounts loaded:', this.accounts);
    });
  }

  async loadTokens() {
    console.log('Loading tokens...');
    this.accountsService.getTokens().subscribe((tokens) => {
      this.tokens = tokens;
      console.log('Tokens loaded:', this.tokens);
    });
  }

  confirmDeleteAccount(accountId: string) {
    this.generateRandomWord();
    this.deleteAccountId = accountId;
    this.showDeleteAccountForm = true;
    this.deleteForm.reset();
    console.log(`Delete account confirmed for ID: ${accountId}`);
  }

  confirmDeleteToken(tokenId: string) {
    this.generateRandomWord();
    this.deleteTokenId = tokenId;
    this.showDeleteTokenForm = true;
    this.deleteForm.reset();
    console.log(`Delete token confirmed for ID: ${tokenId}`);
  }

  deleteAccount() {
    if (this.validateSecurityWord(this.deleteForm.value.securityWord)) {
      this.accountsService.removeAccount(this.deleteAccountId).subscribe(() => {
        console.log('Account deleted:', this.deleteAccountId);
        this.loadAccounts();
        this.deleteAccountId = '';
        this.showDeleteAccountForm = false;
      });
    } else {
      alert('Security word does not match. Please try again.');
    }
  }

  cancelDelete() {
    this.showDeleteAccountForm = false;
    this.showDeleteTokenForm = false;
    console.log('Delete operation cancelled.');
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
}
