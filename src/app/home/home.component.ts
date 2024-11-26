import { Component } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  totalDocuments = 5; // Example: Total number of documents needed
  selectedFiles: File[] = []; // Array to hold selected files
  isModalOpen = false; // For file upload modal
  isViewModalOpen = false; // For "View" modal

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
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      // Add files to the selectedFiles array
      this.selectedFiles = Array.from(files);
      console.log('Files selected:', this.selectedFiles);
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
    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach(file => {
        console.log('Submitting file:', file.name);
        // Add your file upload logic here (e.g., call an API to upload the file)
      });
    } else {
      console.log('No files selected for submission.');
    }
  }
}