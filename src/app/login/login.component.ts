import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  emailValid: boolean = true;
  passwordValid: boolean = true;
  returnUrl: string = '/home';

  constructor(
    private dataService: DataService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get return URL from route parameters or default to '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

// In login.component.ts
onLogin() {
  this.emailValid = this.isEmailValid(this.email);
  this.passwordValid = this.password.length >= 6;

  if (!this.emailValid || !this.passwordValid) {
    Swal.fire({
      title: 'Invalid Input',
      text: 'Please enter a valid email and password (minimum 6 characters).',
      icon: 'warning'
    });
    return;
  }

  this.dataService.userLogin(this.email, this.password).subscribe({
    next: (response) => {
      if (response.success && response.user) {
        Swal.fire({
          title: 'Welcome!',
          text: `Hello, ${response.user.fullname}!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate([this.returnUrl]);
        });
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: response.message || 'Invalid credentials',
          icon: 'error'
        });
      }
    },
    error: (error) => {
      console.error('Login error:', error);
      
      // Special handling for inactive account
      const errorMessage = error.message || 'An error occurred during login';
      const isInactiveAccount = errorMessage.includes('inactive');
      
      Swal.fire({
        title: isInactiveAccount ? 'Account Inactive' : 'Login Failed',
        text: errorMessage,
        icon: isInactiveAccount ? 'warning' : 'error',
        confirmButtonText: isInactiveAccount ? 'Contact Admin' : 'OK'
      }).then((result) => {
        if (isInactiveAccount && result.isConfirmed) {
          // Optionally, provide contact information or redirect to support page
          window.location.href = 'mailto:eoportaltaskingsystem@gmail.com';
        }
      });
    }
  });
}

  isEmailValid(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  navigateToApplicantForm() {
    this.router.navigate(['/applicant-form']);
  }

  navigateToChangePassword() {
    this.router.navigate(['/change-password']);
  }

}