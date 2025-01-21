import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Task, TaskFileResponse, TaskComment } from '../data.service';
import { FileSubmissionModalComponent } from '../file-submission-modal/file-submission-modal.component';
import { FormsModule } from '@angular/forms';

interface TaskWithProgress extends Task {
  progress?: number;
  priority?: 'High' | 'Medium' | 'Low';
  attachments?: { name: string; url: string }[];
}

interface TaskUpdateEvent {
  taskId: number;
  progress: number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface TaskFileSubmission {
  task_id: number;
  files: File[];
  progress: number;
  accomplishment_report: string; // Match the field name from data.service
}


@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FileSubmissionModalComponent, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  tasks: TaskWithProgress[] = [];
  selectedTask: TaskWithProgress | null = null;
  sortOption = 'created_at';
  isModalOpen = false;
  taskComments: TaskComment[] = [];
  accomplishmentDetails: string = '';



  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.dataService.fetchUserTasks(userId).subscribe({
        next: (tasks) => {
          // Enhance tasks with additional properties
          this.tasks = tasks.map(task => ({
            ...task,
            progress: this.calculateTaskProgress(task),
            priority: this.determineTaskPriority(task),
            attachments: [] // Initialize empty attachments array
          }));
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

 selectTask(task: TaskWithProgress) {
    this.selectedTask = task;
    if (task) {
      this.loadTaskComments(task.id);
    }
  }

  sortTasks() {
    if (this.sortOption === 'created_at') {
      this.tasks.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

  // New methods to support enhanced features

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  getDaysRemaining(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getProgressPercentage(task: TaskWithProgress): number {
    return task.progress || 0;  // Use the progress directly from the task object
  }
  

  private calculateTaskProgress(task: Task): number {
    this.dataService.checkTaskFiles(task.id).subscribe({
      next: (result) => {
        task.progress = result.progress;
      },
      error: () => {
        task.progress = 0;
      }
    });
    
    return task.progress || 0;
  }

  private determineTaskPriority(task: Task): 'High' | 'Medium' | 'Low' {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 2) {
      return 'High';
    } else if (daysUntilDue <= 5) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  isOverdue(task: Task): boolean {
    return new Date(task.due_date) < new Date();
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }
  openFileSubmissionModal() {
    this.isModalOpen = true;
  }

  closeFileSubmissionModal() {
    this.isModalOpen = false;
  }

  handleFileSubmission(event: { files: File[]; progress: number }) {
    if (!this.selectedTask) {
      alert('Please select a task first');
      return;
    }
  
    const submission: TaskFileSubmission = {
      task_id: this.selectedTask.id,
      files: event.files,
      progress: event.progress,
      accomplishment_report: this.accomplishmentDetails, // Use the new name
    };
  
    this.dataService.submitTaskFiles(submission).subscribe({
      next: (response: TaskFileResponse) => {
        console.log('File submission response:', response);
        // Handle response...
      },
      error: (error) => {
        console.error('File submission error:', error);
        alert(`Failed to submit files: ${error.message}`);
      },
    });
  }
  
  
  private refreshTasks() {
    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.dataService.fetchUserTasks(userId).subscribe({
        next: (tasks) => {
          this.tasks = tasks.map(task => ({
            ...task,
            progress: this.calculateTaskProgress(task),
            priority: this.determineTaskPriority(task),
            attachments: task.attachments || []  // This will now work with the updated interface
          }));
          this.sortTasks();
        },
        error: (error) => console.error('Error refreshing tasks:', error)
      });
    }
  }

  handleTaskUpdate(event: TaskUpdateEvent) {
    // Update the selected task if it matches
    if (this.selectedTask && this.selectedTask.id === event.taskId) {
      this.selectedTask.progress = event.progress;
      this.selectedTask.status = event.status;
    }

    // Update the task in the tasks array
    this.tasks = this.tasks.map(task => {
      if (task.id === event.taskId) {
        return {
          ...task,
          progress: event.progress,
          status: event.status
        };
      }
      return task;
    });
  }

  loadTaskComments(taskId: number) {
    this.dataService.fetchTaskComments(taskId).subscribe({
      next: (comments) => {
        this.taskComments = comments;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      }
    });
  }
  
}
