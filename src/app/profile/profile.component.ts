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
  profileImage: string = '';
  

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
    this.birthday = this.formatBirthday(localStorage.getItem('birthday') || 'N/A');
    this.department = localStorage.getItem('department') || 'N/A';
    this.profileImage = localStorage.getItem('profileImage') || 'https://via.placeholder.com/180';
   
  }

  // Helper method to format birthday
  private formatBirthday(birthday: string): string {
    if (birthday === 'N/A') return birthday;
    try {
      return new Date(birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return birthday;
    }
  }

  
  // Logout method
  logout() {
    this.dataService.deleteToken();
    localStorage.clear(); // Clear all localStorage data
    
  }

  // Method to handle profile image error

}