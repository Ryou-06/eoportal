import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  birthday: string = ''; // Add birthday field
  department: string = ''; // Add department field
  constructor(private router: Router) {}

  onSignup() {
    // Here, handle your signup logic, e.g., API request to create a new user
    console.log('Signup credentials:', this.name, this.email, this.password);
    // Navigate to the login page after successful signup
    this.router.navigate(['/login']);
  }

  navigateToLogIn() {
    this.router.navigate(['/login']);
  }
}
