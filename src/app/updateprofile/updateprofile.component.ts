import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-updateprofile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './updateprofile.component.html',
  styleUrl: './updateprofile.component.css'
})
export class UpdateprofileComponent implements OnInit {
  fullname: string = '';
  currentEmail: string = '';
  newEmail: string = '';
  birthday: string = '';
  department: string = '';
  selectedDepartment: string = '';
  selectedFile: File | null = null;
  profilePictureUrl: string | null = null;

  departments: string[] = [
    'Accounting', 
    'Human Resources', 
    'IT Department', 
    'Marketing', 
    'Operations'
  ];

  constructor(
    private dataService: DataService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.fullname = localStorage.getItem('fullname') || 'Unknown';
    this.currentEmail = localStorage.getItem('email') || 'N/A';
    this.birthday = localStorage.getItem('birthday') || 'N/A';
    this.department = localStorage.getItem('department') || 'N/A';
    this.selectedDepartment = this.department;
    this.newEmail = this.currentEmail;

    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.dataService.getProfilePicture(userId).subscribe({
        next: (response) => {
          if (response.success && response.profile_picture) {
            this.profilePictureUrl = response.profile_picture;
          } else {
            this.handleProfilePictureError();
          }
        },
        error: () => {
          this.handleProfilePictureError();
        }
      });
    } else {
      this.handleProfilePictureError();
    }
  }

  handleProfilePictureError() {
    this.profilePictureUrl = 'https://via.placeholder.com/180';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSave() {
    if (!this.isValidEmail(this.newEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    this.dataService.updateProfile(
      this.currentEmail, 
      this.newEmail, 
      this.selectedDepartment,
      this.selectedFile || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Profile updated successfully');
          this.router.navigate(['/profile']);
        } else {
          alert(response.message || 'Failed to update profile');
        }
      },
      error: (error) => {
        console.error('Update failed:', error);
      }
    });
  }

  onCancel() {
    // Navigate back to profile
    this.router.navigate(['/profile']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}