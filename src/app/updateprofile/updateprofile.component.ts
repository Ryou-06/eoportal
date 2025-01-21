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
  contactNumber: string = '';
  dateOfBirth: string = '';
  placeOfBirth: string = '';
  nationality: string = '';
  civilStatus: string = '';
  gender: string = '';
  department: string = '';
  position: string = '';
  createdAt: string = '';
  status: string = '';
  profilePictureUrl: string | null = null;
  selectedFile: File | undefined = undefined;

  constructor(
    private dataService: DataService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.fullname = localStorage.getItem('fullname') || '';
    this.currentEmail = localStorage.getItem('email') || '';
    this.newEmail = this.currentEmail;
    this.contactNumber = localStorage.getItem('contact_number') || '';
    this.dateOfBirth = localStorage.getItem('date_of_birth') || '';
    this.placeOfBirth = localStorage.getItem('place_of_birth') || '';
    this.nationality = localStorage.getItem('nationality') || '';
    this.civilStatus = localStorage.getItem('civil_status') || '';
    this.gender = localStorage.getItem('gender') || '';
    this.department = localStorage.getItem('department') || '';
    this.position = localStorage.getItem('position') || '';
    this.createdAt = localStorage.getItem('created_at') || '';
    this.status = localStorage.getItem('status') || '';

    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.loadProfilePicture(userId);
      this.dataService.getProfilePicture(userId).subscribe({
        next: (response) => {
          if (response.success && response.profile_picture) {
            this.profilePictureUrl = response.profile_picture;
          } else {
            this.handleProfilePictureError();
          }
        },
        error: (error) => {
          console.error('Error fetching profile picture:', error);
          this.handleProfilePictureError();
        }
      });
    } else {
      this.handleProfilePictureError();
    }
  }

  handleProfilePictureError(): void {
    this.profilePictureUrl = 'https://via.placeholder.com/180';
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = undefined;  // Change null to undefined
    }
  }
  onSave(): void {
    if (!this.isValidEmail(this.newEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    if (!this.isValidContactNumber(this.contactNumber)) {
      alert('Please enter a valid contact number.');
      return;
    }
  
    this.dataService.updateProfile(
      this.currentEmail,
      this.newEmail,
      this.contactNumber,
      this.civilStatus,
      this.selectedFile
    ).subscribe({
      next: (response) => {
        if (response.success) {
          localStorage.setItem('email', this.newEmail);
          localStorage.setItem('contact_number', this.contactNumber);
          localStorage.setItem('civil_status', this.civilStatus);
          
          alert('Profile updated successfully');
          this.router.navigate(['/profile']);
        } else {
          alert(response.message || 'Failed to update profile');
        }
      },
      error: (error) => {
        console.error('Update failed:', error);
        alert('Failed to update profile: ' + error.message);
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
  loadProfilePicture(userId: number): void {
    this.dataService.getProfilePicture(userId).subscribe({
      next: (response) => {
        if (response.success && response.profile_picture) {
          this.profilePictureUrl = response.profile_picture;
        } else {
          this.handleProfilePictureError();
        }
      },
      error: (error) => {
        console.error('Error fetching profile picture:', error);
        this.handleProfilePictureError();
      }
    });
  }

  private isValidContactNumber(number: string): boolean {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(number);
  }
}