import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  fullname: string = '';
  birthday: string = '';
  department: string = '';
  email: string = '';

  constructor(
    private dataService: DataService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.dataService.isLoggedIn()) {
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
      return;
    }

    // Retrieve user information from localStorage
    this.fullname = localStorage.getItem('fullname') || 'Unknown';
    this.email = localStorage.getItem('email') || 'N/A';
    this.birthday = localStorage.getItem('birthday') || 'N/A';
    this.department = localStorage.getItem('department') || 'N/A';
  }

  logout() {
    this.dataService.deleteToken();
    this.router.navigate(['/login']);
  }
}