import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  email: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  emailValid: boolean = true;

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  isEmailValid(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  onChangePassword() {
    // Reset validation flags
    this.emailValid = this.isEmailValid(this.email);

    if (!this.emailValid) {
      Swal.fire({
        title: 'Invalid Input',
        text: 'Please enter a valid email address.',
        icon: 'warning'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'New passwords do not match',
        icon: 'error'
      });
      return;
    }

    if (this.newPassword.length < 6) {
      Swal.fire({
        title: 'Error',
        text: 'New password must be at least 6 characters long',
        icon: 'error'
      });
      return;
    }

    this.dataService.changePassword(this.email, this.currentPassword, this.newPassword)
      .subscribe({
        next: (response) => {
          if (response.success) {
            Swal.fire({
              title: 'Success',
              text: 'Password changed successfully',
              icon: 'success'
            }).then(() => {
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: response.message || 'Failed to change password',
              icon: 'error'
            });
          }
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: error.message || 'An error occurred while changing password',
            icon: 'error'
          });
        }
      });
  }
}