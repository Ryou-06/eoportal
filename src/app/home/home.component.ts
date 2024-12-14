import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http'; // Add this import
import Swal from 'sweetalert2';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  
  totalDocuments = 5;
  selectedFiles: File[] = [];
  userFiles: any[] = [];
  isModalOpen = false;
  isViewModalOpen = false;
  username: string = '';

  // Inject DataService in the constructor
  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Retrieve the fullname from localStorage
    this.username = localStorage.getItem('fullname') || 'Employee';

    const userId = parseInt(localStorage.getItem('user_id') || '0');
    const email = localStorage.getItem('email');
    console.log('Stored User ID:', userId);
    console.log('Stored Email:', email);
  
    // Get the current login timestamp
    const currentLoginTimestamp = new Date().getTime();
    
    // Retrieve the last login timestamp
    const lastLoginTimestamp = localStorage.getItem('lastLoginTimestamp');

    // Check if this is a new login or a page refresh
    if (!lastLoginTimestamp || this.isNewLogin(currentLoginTimestamp, parseInt(lastLoginTimestamp))) {
      
      // Update the last login timestamp
      localStorage.setItem('lastLoginTimestamp', currentLoginTimestamp.toString());
    }
    this.fetchUserFiles();
  }

  // Check if this is a new login (more than 5 minutes since last login)
  private isNewLogin(currentTimestamp: number, lastLoginTimestamp: number): boolean {
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
    return (currentTimestamp - lastLoginTimestamp) > FIVE_MINUTES;
  }

  // Open the file upload modal
  openModal() {
    this.isModalOpen = true;
  }

  // Close the file upload modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Open the "View" modal
  openViewModal() {
    this.isViewModalOpen = true;
  }

  // Close the "View" modal
  closeViewModal() {
    this.isViewModalOpen = false;
  }

  // Handle file selection (from input)
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  // Handle file drop (from drag-and-drop)
  onFileDrop(event: any) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      // Add files to the selectedFiles array
      this.selectedFiles = Array.from(files);
      console.log('Files dropped:', this.selectedFiles);
    }
  }

  // Prevent default behavior for drag over
  onDragOver(event: any) {
    event.preventDefault();
  }

  // Upload the document (file submission)
  submitFile(): void {
    const userId = parseInt(localStorage.getItem('user_id') || '0');
    
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
  
    this.selectedFiles.forEach((file) => {
      this.dataService.uploadFile(userId, file).subscribe({
        next: (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              console.log('Upload progress', Math.round(100 * event.loaded / (event.total || 1)));
              break;
            case HttpEventType.Response:
              const body = event.body;
              if (body && body.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Upload Successful',
                  text: `${file.name} uploaded successfully`
                });
                this.fetchUserFiles();
                this.isModalOpen = false;
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
        },
        error: (error: any) => {
          console.error('Error fetching files:', error);
        }
      });
    }
  }

}