import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { DataBaseService } from '../services/dataBase.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Account } from '../services/Account';
import { Token } from '../services/Token';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  constructor(public authService: AuthService, private fb: FormBuilder) {}
  accountsService = inject(DataBaseService);
  accountForm: FormGroup;
  tokenForm: FormGroup;
  queryForm: FormGroup;
  deleteForm: FormGroup;
  showForm = false;
  showTokenForm = false;
  showDeleteAccountForm = false;
  showDeleteTokenForm = false;
  accounts: Account[] = [];
  tokens: Token[] = [];
  queriedAccount: Account | null = null;
  randomWord: string = '';
  deleteAccountId: string = '';
  deleteTokenId: string = '';

  ngOnInit() {
    this.loadAccounts();
    this.loadTokens();

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
  }

  generateRandomWord() {
    const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    this.randomWord = words[Math.floor(Math.random() * words.length)];
  }

  validateSecurityWord(inputWord: string): boolean {
    return inputWord === this.randomWord;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  toggleTokenForm() {
    this.showTokenForm = !this.showTokenForm;
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
      this.accountsService.getAccountByEmail(email).subscribe((accounts) => {
        this.queriedAccount = accounts.length > 0 ? accounts[0] : null;
        console.log(this.queriedAccount);
      });
    }
  }

  loadAccounts() {
    this.accountsService.getAccounts().subscribe((accounts) => {
      this.accounts = accounts;
    });
  }

  loadTokens() {
    this.accountsService.getTokens().subscribe((tokens) => {
      this.tokens = tokens;
    });
  }

  confirmDeleteAccount(accountId: string) {
    this.generateRandomWord();
    this.deleteAccountId = accountId;
    this.showDeleteAccountForm = true;
    this.deleteForm.reset();
  }

  confirmDeleteToken(tokenId: string) {
    this.generateRandomWord();
    this.deleteTokenId = tokenId;
    this.showDeleteTokenForm = true;
    this.deleteForm.reset();
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
