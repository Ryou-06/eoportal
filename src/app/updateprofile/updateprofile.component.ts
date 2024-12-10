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
  email: string = '';
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
    this.email = localStorage.getItem('email') || 'N/A';
    this.birthday = localStorage.getItem('birthday') || 'N/A';
    this.department = localStorage.getItem('department') || 'N/A';
    this.selectedDepartment = this.department;
  }

  onSave() {
    // Call service method to update department
    this.dataService.updateDepartment(this.email, this.selectedDepartment)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Update localStorage
            localStorage.setItem('department', this.selectedDepartment);
            
            // Show success message
            alert('Department updated successfully');
            
            // Navigate back to profile
            this.router.navigate(['/profile']);
          } else {
            // Show error message
            alert(response.message || 'Failed to update department');
          }
        },
        error: (error) => {
          console.error('Update failed:', error);
          alert('Failed to update department. Please try again.');
        }
      });
  }

  onCancel() {
    // Navigate back to profile
    this.router.navigate(['/profile']);
  }
}