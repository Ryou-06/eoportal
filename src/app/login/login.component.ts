import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    // Here, handle your login logic, e.g., API request for authentication
    console.log('Login credentials:', this.email, this.password);
    // Navigate to the dashboard or home page
    this.router.navigate(['/dashboard']);
  }
  navigateToSignUp() {
    this.router.navigate(['/signup']); // Navigate to Sign-Up page
  }
}

