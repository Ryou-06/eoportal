import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Task } from '../data.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  selectedTask: Task | null = null;
  sortOption = 'created_at';
  
  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.dataService.fetchUserTasks(userId).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.sortTasks();
          // Set the first task as selected by default
          if (this.tasks.length > 0) {
            this.selectedTask = this.tasks[0];
          }
        },
        error: (error) => console.error('Error fetching tasks:', error)
      });
    }
  }

  selectTask(task: Task) {
    this.selectedTask = task;
  }

  sortTasks() {
    if (this.sortOption === 'created_at') {
      this.tasks.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else {
      const today = new Date();
      this.tasks.sort((a, b) => {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        const diffA = Math.abs(dateA.getTime() - today.getTime());
        const diffB = Math.abs(dateB.getTime() - today.getTime());
        return diffA - diffB;
      });
    }
  }

  onSortChange(event: Event) {
    this.sortOption = (event.target as HTMLSelectElement).value;
    this.sortTasks();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}