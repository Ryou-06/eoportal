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
      this.dataService.checkTaskFiles(this.taskId).subscribe({
        next: (result) => {
          if (!result.hasFiles) {
            this.progress = 0;
          }
        },
        error: () => {
          this.progress = 0;
        }
      });
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
        console.log('Fetched task files:', files);
        this.pastFiles = files;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load task files:', error);
        this.error = error.message || 'Failed to load files. Please try again.';
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Files',
          text: error.message || 'Failed to load files. Please try again.' // Ensure we always pass a string
        });
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No task selected'
      });
      return;
    }

    if (this.selectedFiles.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Files Selected',
        text: 'Please select at least one file to submit.'
      });
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
    if (!fileId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'File ID is missing or invalid.'
      });
      return;
    }
  
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: 'Deleting...',
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          allowEscapeKey: false
        });
  
        this.dataService.deleteTaskFile(fileId).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: response.message || 'File has been deleted successfully.'
              });
              // Update the UI by removing the deleted file
              this.pastFiles = this.pastFiles.filter(file => file.id !== fileId);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: response.message || 'Failed to delete file'
              });
            }
          },
          error: (error) => {
            console.error('Delete file error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: error.message || 'Unable to delete file'
            });
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

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}