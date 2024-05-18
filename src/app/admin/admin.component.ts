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
  queryForm: FormGroup;
  showForm = false;
  accounts: Account[] = [];
  queriedAccount: Account | null = null;

  ngOnInit() {
    this.loadAccounts();

    this.accountForm = this.fb.group({
      accountId: ['', Validators.required],
      accountPrivateKey: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.queryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
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

  deleteAccount(docId: string) {
    this.accountsService.removeAccount(docId).subscribe(() => {
      console.log('Account deleted:', docId);
      this.loadAccounts();
    });
  }
}
