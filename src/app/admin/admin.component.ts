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
  showForm = false;
  showTokenForm = false;
  accounts: Account[] = [];
  tokens: Token[] = [];
  queriedAccount: Account | null = null;

  ngOnInit() {
    this.loadAccounts();
    this.loadTokens();

    this.accountForm = this.fb.group({
      accountId: ['', Validators.required],
      accountPrivateKey: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.tokenForm = this.fb.group({
      tokenName: ['', Validators.required],
      tokenSymbol: ['', Validators.required],
      tokenId: ['', Validators.required],
    });

    this.queryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  toggleTokenForm() {
    this.showTokenForm = !this.showTokenForm;
  }

  addAccount() {
    if (this.accountForm.valid) {
      const account = this.accountForm.value;
      this.accountsService.addAccount(account).subscribe((id) => {
        console.log('Account added with ID:', id);
        this.accountForm.reset();
        this.showForm = false;
        this.loadAccounts();
      });
    }
  }

  addToken() {
    if (this.tokenForm.valid) {
      const token = this.tokenForm.value;
      this.accountsService.addToken(token).subscribe((id) => {
        console.log('Token added with ID:', id);
        this.tokenForm.reset();
        this.showTokenForm = false;
        this.loadTokens();
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

  deleteAccount(accountId: string) {
    this.accountsService.removeAccount(accountId).subscribe(() => {
      console.log('Account deleted:', accountId);
      this.loadAccounts();
    });
  }

  deleteToken(tokenId: string) {
    this.accountsService.removeToken(tokenId).subscribe(() => {
      console.log('Token deleted:', tokenId);
      this.loadTokens();
    });
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
