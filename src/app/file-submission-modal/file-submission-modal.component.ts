import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, TaskFile } from '../data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-file-submission-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-submission-modal.component.html',
  styleUrls: ['./file-submission-modal.component.css']
})
export class FileSubmissionModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() taskId?: number;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{files: File[], progress: number}>();

  progress = 0;
  selectedFiles: File[] = [];
  pastFiles: TaskFile[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    if (this.taskId) {
      this.loadTaskFiles();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['taskId'] && !changes['taskId'].firstChange) || 
        (changes['isOpen'] && changes['isOpen'].currentValue === true)) {
      this.loadTaskFiles();
    }
  }

  private loadTaskFiles() {
    if (!this.taskId) {
      this.error = 'No task selected';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.dataService.fetchTaskFiles(this.taskId).subscribe({
      next: (files) => {
        console.log('Raw task files data:', files);
        this.pastFiles = files.map(file => ({
          ...file,
          id: file.id // Use file.id directly
        }));
        console.log('Processed pastFiles:', this.pastFiles);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load task files:', error);
        this.error = 'Failed to load files. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit() {
    if (!this.taskId) {
      alert('No task selected');
      return;
    }

    if (this.selectedFiles.length === 0) {
      alert('Please select at least one file to submit.');
      return;
    }

    this.submit.emit({
      files: this.selectedFiles,
      progress: this.progress
    });
    
    this.resetAndClose();
  }

  onCancel() {
    this.resetAndClose();
  }

  private resetAndClose() {
    this.selectedFiles = [];
    this.progress = 0;
    this.pastFiles = [];
    this.error = null;
    this.close.emit();
  }

  deletePastFile(fileId: number) {
    console.log('Attempting to delete file with ID:', fileId);
    if (!fileId) {
      console.error('Invalid fileId:', fileId);
      Swal.fire('Error', 'File ID is missing or invalid.', 'error');
      return;
    }

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
        this.dataService.deleteTaskFile(fileId).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
              this.loadTaskFiles(); // Refresh the list
            } else {
              Swal.fire('Error!', response.message || 'Failed to delete file', 'error');
            }
          },
          error: (error) => {
            console.error('Delete file error:', error);
            Swal.fire('Error!', 'Unable to delete file', 'error');
          }
        });
      }
    });
  }
  
  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📎';
    }
  }
}