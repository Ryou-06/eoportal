import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Task, TaskFileSubmission, TaskFileResponse } from '../data.service';
import { FileSubmissionModalComponent } from '../file-submission-modal/file-submission-modal.component';

interface TaskWithProgress extends Task {
  progress?: number;
  priority?: 'High' | 'Medium' | 'Low';
  attachments?: { name: string; url: string }[];
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FileSubmissionModalComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  tasks: TaskWithProgress[] = [];
  selectedTask: TaskWithProgress | null = null;
  sortOption = 'created_at';
  isModalOpen = false;
  
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
    if (task.progress !== undefined) {
      return task.progress;
    }
    return this.calculateTaskProgress(task);
  }

  private calculateTaskProgress(task: Task): number {
    switch(task.status.toLowerCase()) {
      case 'completed':
        return 100;
      case 'in progress':
        return 50;
      case 'pending':
        return 0;
      default:
        return 0;
    }
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

  handleFileSubmission(event: {files: File[], progress: number}) {
    if (!this.selectedTask) {
      alert('Please select a task first');
      return;
    }

    // Debug log the submission data
    console.log('Submitting files:', {
      taskId: this.selectedTask.id,
      files: event.files,
      progress: event.progress
    });
  
    const submission: TaskFileSubmission = {
      task_id: this.selectedTask.id,
      files: event.files,
      progress: event.progress
    };
  
    this.dataService.submitTaskFiles(submission).subscribe({
      next: (response: TaskFileResponse) => {
        console.log('File submission response:', response);
        
        if (response.success && this.selectedTask) {
          // Update local task data
          this.selectedTask.progress = event.progress;
          this.selectedTask.status = event.progress === 100 ? 'Completed' : 'In Progress';
          
          if (response.files && response.files.length > 0) {
            if (!this.selectedTask.attachments) {
              this.selectedTask.attachments = [];
            }
            
            const newAttachments = response.files.map(file => ({
              name: file.filename,
              url: file.filepath
            }));
            
            this.selectedTask.attachments = [
              ...this.selectedTask.attachments,
              ...newAttachments
            ];
          }
          
          this.refreshTasks();
          this.closeFileSubmissionModal();
          alert('Files submitted successfully!');
        }
      },
      error: (error) => {
        console.error('File submission error:', error);
        alert(`Failed to submit files: ${error.message}`);
      }
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
}
