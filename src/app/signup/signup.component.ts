import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {
    // Define the form structure here
    this.signupForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthday: ['', Validators.required],
      department: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  // Method to handle form submission
  onSignup(): void {
    if (this.signupForm.valid) {
      const { fullname, email, password, birthday, department } = this.signupForm.value;

      // Call the service to register the user
      this.dataService.userRegistration(fullname, email, password, birthday, department)
        .subscribe(
          (response) => {
            // After successful registration, navigate to the login page
            this.router.navigate(['/login']);
          },
          (error) => {
            console.error('Registration failed:', error);
            // You can add error handling here, such as showing a message to the user
          }
        );
    } else {
      console.log('Form is invalid');
    }
  }

  // Getters for form controls
  get fullname() { return this.signupForm.get('fullname'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get birthday() { return this.signupForm.get('birthday'); }
  get department() { return this.signupForm.get('department'); }

  // Handle navigation to the login page
  navigateToLogIn() {
    this.router.navigate(['/login']);
  }
}