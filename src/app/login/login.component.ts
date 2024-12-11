import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  emailValid: boolean = true;  // Add validation flag
  passwordValid: boolean = true;  // Add validation flag

  constructor(private dataService: DataService, private router: Router) {}


  onLogin() {
    console.log('Login attempt:', { email: this.email, password: this.password });
  
    // Basic validation before sending a request
    this.emailValid = this.isEmailValid(this.email);
    this.passwordValid = this.password.length >= 6;
  
    if (!this.emailValid || !this.passwordValid) {
      Swal.fire({
        title: 'Invalid Input',
        text: 'Please enter a valid email and password.',
        icon: 'warning',
        confirmButtonText: 'Okay'
      });
      return;
    }
  
    this.dataService.userLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response.success) {
          console.log('Login successful');
          const userName = response.user?.fullname || 'User';
  
          Swal.fire({
            title: 'Welcome!',
            text: `Hello, ${userName}! We're glad to have you back.`,
            icon: 'success',
            confirmButtonText: 'Continue'
          }).then(() => {
            const returnUrl = this.dataService.redirectUrl || '/home';
            this.router.navigate([returnUrl]);
          });
        } else {
          // Show error message when email or password is incorrect
          console.log('Login failed:', response.message);
          Swal.fire({
            title: 'Login Failed',
            text: response.message || 'Invalid email or password.',
            icon: 'error',
            confirmButtonText: 'Try Again'
          });
        }
      },
      error: (error) => {
        console.error('Login error', error);
        Swal.fire({
          title: 'Error',
          text: 'Login failed. Please try again later.',
          icon: 'error',
          confirmButtonText: 'Close'
        });
      }
    });
  }
  

  // this.router.navigate(['/home']);

  // Simple email validation
  isEmailValid(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  // Example of navigating to sign-up page
  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }
}