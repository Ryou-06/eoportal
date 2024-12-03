import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    console.log('Login attempt:', { email: this.email, password: this.password }); // Debugging line
    this.dataService.userLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response); // Log the response from the backend
        if (response.success) {
          console.log('Login successful');
          // Check if there's a returnUrl to redirect to
          const returnUrl = this.dataService.redirectUrl || '/home';
          this.router.navigate([returnUrl]); // Redirect to the original route or default to home
        } else {
          console.log('Login failed: ', response.message); // Log failure message if any
          alert(response.message); // Show failure message to the user
        }
      },
      error: (error) => {
        console.error('Login error', error);
        alert('Login failed. Please try again.');
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