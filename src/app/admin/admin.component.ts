import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { DataBaseService } from '../services/dataBase.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  constructor(public authService: AuthService) {}
  accounts = inject(DataBaseService);

  ngOnInit() {
    this.accounts.getAccounts().subscribe((accounts) => {
      console.log(accounts);
    });
  }
}
