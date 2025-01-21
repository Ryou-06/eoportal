import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DataService, Message } from '../data.service';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { TaskTimelineChartComponent } from '../task-timeline-chart/task-timeline-chart.component';

interface FileWithType {
  file: File;
  documentType: string;
  preview: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent, CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDividerModule, TaskTimelineChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  
  totalDocuments = 5;
  totalAssignedTasks = 0;
  selectedFiles: FileWithType[] = [];
  userFiles: any[] = [];
  userTasks: any[] = [];
  isModalOpen = false;
  isViewModalOpen = false;
  isTaskViewModalOpen = false;
  isCompanyResourcesModalOpen = false; // New modal for company resources
  username: string = '';
  messages: Message[] = [];

  documentTypes = [
    'Government-issued ID',
    'Tax Identification Number',
    'Resume', 
    'Bank Account Details',
    'Signed Employment Contract'
  ];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.username = localStorage.getItem('fullname') || 'Employee';
    const userId = parseInt(localStorage.getItem('user_id') || '0');
    const email = localStorage.getItem('email');
    
    const currentLoginTimestamp = new Date().getTime();
    const lastLoginTimestamp = localStorage.getItem('lastLoginTimestamp');

    if (!lastLoginTimestamp || this.isNewLogin(currentLoginTimestamp, parseInt(lastLoginTimestamp))) {
      localStorage.setItem('lastLoginTimestamp', currentLoginTimestamp.toString());
    }
    if (userId) {
      this.fetchUserTasks(userId);
      this.fetchUserFiles();
      this.fetchUserMessages(userId);

    }
  }

  private isNewLogin(currentTimestamp: number, lastLoginTimestamp: number): boolean {
    const FIVE_MINUTES = 5 * 60 * 1000;
    return (currentTimestamp - lastLoginTimestamp) > FIVE_MINUTES;
  }
  
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedFiles = [];
  }

  openViewModal() {
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
  }

  // Add this method to handle dragover event
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  processFiles(files: File[]) {
    files.forEach(file => {
      // Check file type and size
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only JPEG, PNG, GIF, and PDF files are allowed.'
        });
        return;
      }

      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'File must be less than 5MB.'
        });
        return;
      }

      // Create file preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file: file,
          documentType: '', // Initially no type selected
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  submitFile(): void {
    const userId = parseInt(localStorage.getItem('user_id') || '0');
    
    // Validate document types are selected
    const unselectedTypes = this.selectedFiles.filter(f => !f.documentType);
    if (unselectedTypes.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Document Type Missing',
        text: 'Please select a document type for all uploaded files.'
      });
      return;
    }
    
    if (this.selectedFiles.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Files',
        text: 'Please select at least one file to upload'
      });
      return;
    }
  
    if (userId <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'User Error',
        text: 'Please log in again'
      });
      return;
    }
  
    this.selectedFiles.forEach((fileObj) => {
      this.dataService.uploadFile(userId, fileObj.file, fileObj.documentType).subscribe({
        next: (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Response:
              const body = event.body;
              if (body && body.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Upload Successful',
                  text: `${fileObj.file.name} uploaded successfully`
                });
                this.fetchUserFiles();
                this.isModalOpen = false;
                this.selectedFiles = [];
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Upload Failed',
                  text: body.error || 'Unable to upload file'
                });
              }
              break;
          }
        },
        error: (error) => {
          console.error('Full error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error.error?.error || error.message || 'Unable to upload file'
          });
        }
      });
    });
  }

  fetchUserFiles(): void {
    const userId = parseInt(localStorage.getItem('user_id') || '0');
    if (userId) {
      this.dataService.fetchUserFiles(userId).subscribe({
        next: (files: any[]) => {
          console.log('Fetched files:', files);
          this.userFiles = files;
          // Update totalDocuments to reflect the number of files
          this.totalDocuments = files.length;
        },
        error: (error: any) => {
          console.error('Error fetching files:', error);
          // Reset totalDocuments if there's an error
          this.totalDocuments = 0;
        }
      });
    } else {
      // Reset totalDocuments if no user ID
      this.totalDocuments = 0;
    }
  }
  // Add this method to your component
canSubmit(): boolean {
  return this.selectedFiles.length > 0 && 
         this.selectedFiles.every(file => file.documentType);
}

deleteFile(fileId: number) {
  // Show confirmation dialog
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this file?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.dataService.deleteFile(fileId).subscribe({
        next: (response: any) => {
          if (response.success) {
            Swal.fire(
              'Deleted!', 
              'Your file has been deleted.', 
              'success'
            );
            // Refresh the user files list
            this.fetchUserFiles();
          } else {
            Swal.fire(
              'Error!', 
              response.message || 'Failed to delete file', 
              'error'
            );
          }
        },
        error: (error) => {
          console.error('Delete file error:', error);
          Swal.fire(
            'Error!', 
            'Unable to delete file', 
            'error'
          );
        }
      });
    }
  });
}

  openTaskViewModal() {
    this.isTaskViewModalOpen = true;
  }

  closeTaskViewModal() {
    this.isTaskViewModalOpen = false;
  }
  fetchUserTasks(userId: number): void {
    this.dataService.fetchUserTasks(userId).subscribe({
      next: (tasks: any[]) => {
        console.log('Fetched tasks:', tasks);
        this.userTasks = tasks;
        this.totalAssignedTasks = tasks.length;
      },
      error: (error: any) => {
        console.error('Error fetching tasks:', error);
        this.totalAssignedTasks = 0;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch tasks. Please try again later.'
        });
      }
    });
  }
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  fetchUserMessages(userId: number) {
    this.dataService.fetchUserMessages(userId).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
      }
    });
  }
  markAsRead(messageId: number) {
    this.dataService.markMessageAsRead(messageId).subscribe({
      next: (response) => {
        if (response.success) {
          const message = this.messages.find(m => m.message_id === messageId);
          if (message) {
            message.is_read = true;
          }
        }
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
      }
    });
  }

  formatMessageDate(date: string): string {
    return new Date(date).toLocaleString();
  }
  
}