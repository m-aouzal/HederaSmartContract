import {Component, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  mstBalance: number = 1000;
  mptBalance: number = 500;
  rewards: number = 50;
  recipientAccountId: string = '';
  transactionAmount: number = 0;
  stakeAmount: number = 0;
  unstakeAmount: number = 0;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Simulated API call to get balances
    this.getBalances();
  }

  getBalances() {
    // Dummy data
    this.mstBalance = 1000;
    this.mptBalance = 500;
    this.rewards = 50;
  }

  sendTransaction() {
    if (this.transactionAmount > 0 && this.transactionAmount <= this.mptBalance) {
      this.mptBalance -= this.transactionAmount;
      alert(`Sent ${this.transactionAmount} MPT tokens to ${this.recipientAccountId}`);
    }
  }

  stakeTokens() {
    if (this.stakeAmount > 0 && this.stakeAmount <= this.mstBalance) {
      this.mstBalance -= this.stakeAmount;
      alert(`Staked ${this.stakeAmount} MST tokens`);
    }
  }

  unstakeTokens() {
    // Dummy functionality
    alert(`Unstaked ${this.unstakeAmount} MST tokens`);
  }

  claimRewards() {
    // Dummy functionality
    alert(`Claimed ${this.rewards} MPT tokens`);
    this.rewards = 0;
  }

  logout() {
    this.authService.logout();
  }
}
