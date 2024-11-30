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
  birthday: string = ''; // ISO format (YYYY-MM-DD)
  department: string = '';

  constructor(private router: Router) {}

  onSignup() {
    // Ensure all required fields are filled
    if (!this.name || !this.email || !this.password || !this.birthday || !this.department) {
      alert('Please fill in all fields before signing up.');
      return;
    }

    // Log form data (replace with actual signup logic, such as API integration)
    console.log('Signup credentials:', {
      name: this.name,
      email: this.email,
      password: this.password,
      birthday: this.birthday,
      department: this.department,
    });

    // Navigate to login page after successful signup
    alert('Signup successful! Redirecting to login...');
    this.router.navigate(['/login']);
  }

  navigateToLogIn() {
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
