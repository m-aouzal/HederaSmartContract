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
import { Account } from '../Interfaces/Account';
import { Token } from '../Interfaces/Token';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';
  errorMessage: string | null = null;
  authFailed: boolean = false;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private hederaService: HederaService,
    private dbService: DataBaseService,
    private router: Router
  ) {}

  accountsService = inject(DataBaseService);
  accountForm: FormGroup;
  tokenForm: FormGroup;
  queryForm: FormGroup;
  deleteForm: FormGroup;
  transferForm: FormGroup;
  mintForm: FormGroup;
  showForm = false;
  showTokenForm = false;
  showDeleteAccountForm = false;
  showTransferForm = false;
  showMintForm = false;
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
  mintSpinner: boolean = false;
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
    this.getAccountDetailsByAlias('admin');

    this.accountForm = this.fb.group(
      {
        accountId: ['', Validators.required],
        accountPrivateKey: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        alias: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

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

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordFieldType =
      this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
  }

  addAccount() {
    if (this.accountForm.valid) {
      const account: Account = this.accountForm.value;
      this.accountsService.addAccount(account).subscribe({
        next: (id) => {
          console.log('Account added with ID:', id);
          alert('Account added successfully.');
          this.accountForm.reset();
          this.showForm = false;
          setTimeout(() => this.loadAccounts(), 2000); // Fetch accounts after 2 seconds
        },
        error: (err) => {
          console.error('Error adding account:', err);
          this.errorMessage = err.message;
          this.authFailed = true;
        },
      });
    }
  }

  signup() {
    if (this.accountForm.valid) {
      const { alias, email, password } = this.accountForm.value;
      this.authService.signup(alias, email, password).subscribe({
        next: () => {
          console.log('User signed up successfully');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error signing up user:', err);
          this.errorMessage = err.message;
          this.authFailed = true;
        },
      });
    }
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
        `MST Balance: ${Math.floor(this.mstBalance)}, MPT Balance: ${Math.floor(
          this.mptBalance
        )}`
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

        await new Promise((resolve) => setTimeout(resolve, 4500));

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
    this.showTransferForm = false;
    this.showMintForm = false;
    console.log(`Show form toggled: ${this.showForm}`);
  }

  toggleTokenForm() {
    this.showTokenForm = !this.showTokenForm;
    this.showTransferForm = false;
    this.showMintForm = false;
    console.log(`Show token form toggled: ${this.showTokenForm}`);
  }

  toggleTransferForm() {
    this.showTransferForm = !this.showTransferForm;
    this.showForm = false;
    this.showMintForm = false;
    console.log(`Show transfer form toggled: ${this.showTransferForm}`);
  }
  toggleMintForm() {
    this.showMintForm = !this.showMintForm;
    this.showTransferForm = false;
    this.showForm = false;
    console.log(`Show mint form toggled: ${this.showMintForm}`);
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

  maskValue(value: string): string {
    return value ? value.substring(0, 4) + '****' : '';
  }
}
