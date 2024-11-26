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
  selectedFile: File | null = null;
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
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  }

  // Handle file drop (from drag-and-drop)
  onFileDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      console.log('File dropped:', file.name);
    }
  }

  // Prevent default behavior for drag over
  onDragOver(event: any) {
    event.preventDefault();
  }

  // Upload the document (you can add upload logic here)
  uploadDocument(): void {
    if (this.selectedFile) {
      console.log('Uploading:', this.selectedFile.name);
    } else {
      console.log('No file selected.');
    }
  }
}