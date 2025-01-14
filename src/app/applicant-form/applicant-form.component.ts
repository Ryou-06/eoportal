import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';

interface DocumentUpload {
  file: File;
  type: string;
  progress?: number; // Add progress property
}
@Component({
  selector: 'app-applicant-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './applicant-form.component.html',
  styleUrl: './applicant-form.component.css'
})
export class ApplicantFormComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  applicationForm: FormGroup;
  isSubmitting = false;
  isDragOver = false;
  documentUploads: Map<string, DocumentUpload> = new Map();

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {
    this.applicationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      suffix: [''],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      placeOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      civilStatus: ['', Validators.required],
      gender: ['', Validators.required]
    });
  }
  
  get formControls() {
    return this.applicationForm.controls;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not allowed. Please upload PDF, DOC, DOCX, JPG, or PNG files only.`);
        return;
      }

      const fileId = `file-${Date.now()}-${file.name}`;
      this.documentUploads.set(fileId, {
        file: file,
        type: file.type
      });
    });
  }

  removeFile(fileId: string): void {
    this.documentUploads.delete(fileId);
  }

  triggerFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = (e) => this.onFileSelected(e);
    input.click();
  }

  getUploadProgress(documentType: string): number {
    return this.documentUploads.get(documentType)?.progress || 0;
  }

  private validateForm(): string[] {
    const errors: string[] = [];
    const controls = this.applicationForm.controls;
    
    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.errors) {
        if (control.errors['required']) {
          errors.push(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
        }
        if (control.errors['pattern'] && key === 'contactNumber') {
          errors.push('Contact number must be 10-11 digits');
        }
        if (control.errors['pattern'] && !['contactNumber'].includes(key)) {
          errors.push(`${key.charAt(0).toUpperCase() + key.slice(1)} cannot contain numbers`);
        }
        if (control.errors['email']) {
          errors.push('Invalid email format');
        }
      }
    });

    return errors;
  }

  async onSubmit() {
    const formErrors = this.validateForm();
    
    if (formErrors.length > 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Form Validation Error',
        html: formErrors.join('<br>'),
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.documentUploads.size === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Documents Uploaded',
        text: 'Please upload at least one required document before submitting.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.applicationForm.valid) {
      this.isSubmitting = true;

      try {
        const applicationData = this.applicationForm.value;
        const response = await firstValueFrom(this.dataService.submitApplication(applicationData));

        if (response && response.applicantId) {
          const applicantId = response.applicantId;
          const uploadPromises = Array.from(this.documentUploads.values()).map(
            upload => this.uploadDocument(applicantId, upload)
          );
          
          await Promise.all(uploadPromises);

          await Swal.fire({
            icon: 'success',
            title: 'Application Submitted',
            text: 'Please wait for the application to be approved by the Administrator.',
            confirmButtonText: 'OK'
          });

          this.router.navigate(['/login']);
        } else {
          throw new Error('No applicant ID received');
        }
      } catch (error) {
        console.error('Application submission failed:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'There was an error submitting your application. Please try again.',
          confirmButtonText: 'OK'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  private async uploadDocument(applicantId: number, upload: DocumentUpload): Promise<void> {
    const formData = new FormData();
    formData.append('file', upload.file);
    formData.append('type', upload.type);
    formData.append('applicantId', applicantId.toString());

    try {
      await firstValueFrom(this.dataService.uploadDocument(formData));
    } catch (error) {
      console.error(`Failed to upload ${upload.type}:`, error);
      throw error;
    }
  }
}