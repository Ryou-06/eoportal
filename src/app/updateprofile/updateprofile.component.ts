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
    // Check if user is logged in
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Retrieve user information from localStorage
    this.fullname = localStorage.getItem('fullname') || 'Unknown';
    this.currentEmail = localStorage.getItem('email') || 'N/A';
    this.birthday = localStorage.getItem('birthday') || 'N/A';
    this.department = localStorage.getItem('department') || 'N/A';
    this.selectedDepartment = this.department;
    
    // Set new email to current email by default
    this.newEmail = this.currentEmail;
  }


  onSave() {
    // Validate email
    if (!this.isValidEmail(this.newEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Call service method to update profile
    this.dataService.updateProfile(this.currentEmail, this.newEmail, this.selectedDepartment)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Show success message
            alert('Profile updated successfully');
            
            // Navigate back to profile
            this.router.navigate(['/profile']);
          } else {
            // Show error message
            alert(response.message || 'Failed to update profile');
          }
        },
        error: (error) => {
          console.error('Update failed:', error);
          // Error handling is now done in the service
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