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
  profilePicture: string = '';

  constructor(
    private dataService: DataService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Retrieve user information from localStorage
    this.fullname = localStorage.getItem('fullname') || 'Unknown';
    this.email = localStorage.getItem('email') || 'N/A';
    this.birthday = this.formatBirthday(localStorage.getItem('birthday') || 'N/A');
    this.department = localStorage.getItem('department') || 'N/A';
    
    // Get profile picture
    const userId = Number(localStorage.getItem('user_id'));
    if (!userId) {
      this.handleProfilePictureError();
      return;
    }

    // Always fetch fresh profile picture from server
    this.dataService.getProfilePicture(userId).subscribe({
      next: (response) => {
        if (response.success && response.profile_picture) {
          this.profilePicture = response.profile_picture;
          // Update localStorage with the latest URL
          localStorage.setItem('profilePicture', response.profile_picture);
        } else {
          this.handleProfilePictureError();
        }
      },
      error: () => {
        this.handleProfilePictureError();
      }
    });
  }

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
  
  logout() {
    this.dataService.deleteToken();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  handleProfilePictureError() {
    this.profilePicture = 'https://via.placeholder.com/180';
  }
}