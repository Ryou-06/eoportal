import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Task } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  fullname: string = '';
  birthday: string = '';
  department: string = '';
  email: string = '';
  profilePicture: string = '';
  recentTasks: Task[] = [];

  constructor(
    private dataService: DataService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.dataService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadProfileData();
    this.loadRecentTasks();
  }

  private loadProfileData(): void {
    this.fullname = localStorage.getItem('fullname') || 'Unknown';
    this.email = localStorage.getItem('email') || 'N/A';
    this.birthday = this.formatBirthday(localStorage.getItem('birthday') || 'N/A');
    this.department = localStorage.getItem('department') || 'N/A';
    
    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.dataService.getProfilePicture(userId).subscribe({
        next: (response) => {
          if (response.success && response.profile_picture) {
            this.profilePicture = response.profile_picture;
            localStorage.setItem('profilePicture', response.profile_picture);
          } else {
            this.handleProfilePictureError();
          }
        },
        error: () => this.handleProfilePictureError()
      });
    }
  }

  private loadRecentTasks(): void {
    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.dataService.fetchUserTasks(userId).subscribe({
        next: (tasks) => {
          // Filter tasks created within the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          this.recentTasks = tasks
            .filter(task => new Date(task.created_at) >= thirtyDaysAgo)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 6); // Keep only the 6 most recent tasks
        },
        error: (error) => console.error('Error loading tasks:', error)
      });
    }
  }

  private formatBirthday(birthday: string): string {
    if (birthday === 'N/A') return birthday;
    try {
      return new Date(birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return birthday;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  handleProfilePictureError(): void {
    this.profilePicture = 'https://via.placeholder.com/200';
  }

  logout(): void {
    this.dataService.deleteToken();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}