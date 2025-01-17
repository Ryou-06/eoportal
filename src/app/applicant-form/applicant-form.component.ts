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
  type: 'Resume' | 'Government ID' | 'Birth Certificate' | 'Diploma' | 'Training Certificates' | 'Other';
  progress?: number;
}

interface DepartmentPositions {
  [key: string]: string[];
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
  documentUploads = new Map<string, DocumentUpload>();

  documentTypes: Array<DocumentUpload['type']> = [
    'Resume',
    'Government ID',
    'Birth Certificate',
    'Diploma',
    'Training Certificates',
    'Other'
  ];

  departments = [
    'Human Resources',
    'Information Technology',
    'Marketing',
    'Finance',
    'Operations',
    'Sales'
  ];

  departmentPositions: DepartmentPositions = {
    'Human Resources': [
      'HR Manager',
      'HR Officer',
      'Recruitment Specialist',
      'Training and Development Officer',
      'HR Assistant',
      'Employee Relations Officer'
    ],
    'Information Technology': [
      'IT Manager',
      'Software Developer',
      'System Administrator',
      'Network Engineer',
      'Database Administrator',
      'IT Support Specialist',
      'QA Engineer',
      'Business Analyst'
    ],
    'Marketing': [
      'Marketing Manager',
      'Digital Marketing Specialist',
      'Content Writer',
      'Social Media Manager',
      'Brand Manager',
      'Marketing Coordinator',
      'SEO Specialist'
    ],
    'Finance': [
      'Finance Manager',
      'Accountant',
      'Financial Analyst',
      'Budget Analyst',
      'Bookkeeper',
      'Treasury Analyst',
      'Payroll Specialist'
    ],
    'Operations': [
      'Operations Manager',
      'Project Manager',
      'Quality Assurance Manager',
      'Process Improvement Specialist',
      'Operations Coordinator',
      'Logistics Coordinator',
      'Supply Chain Manager'
    ],
    'Sales': [
      'Sales Manager',
      'Account Executive',
      'Sales Representative',
      'Business Development Manager',
      'Sales Coordinator',
      'Key Account Manager',
      'Inside Sales Representative'
    ]
  };

  availablePositions: string[] = [];


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
      gender: ['', Validators.required],
      department: ['', Validators.required],
      position: [{ value: '', disabled: true }, Validators.required]
    });

    // Subscribe to department changes to update available positions
    this.applicationForm.get('department')?.valueChanges.subscribe(department => {
      const positionControl = this.applicationForm.get('position');
      if (department) {
        this.availablePositions = this.departmentPositions[department] || [];
        positionControl?.enable();
      } else {
        this.availablePositions = [];
        positionControl?.disable();
      }
      positionControl?.setValue(''); // Reset position when department changes
    });
  }
  isPositionDisabled(): boolean {
    return !this.applicationForm.get('department')?.value;
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
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: `File "${file.name}" is not allowed. Please upload PDF, DOC, DOCX, JPG, or PNG files only.`
        });
        return;
      }

      // Assign a default document type (can be changed by user)
      const fileId = `file-${Date.now()}-${file.name}`;
      this.documentUploads.set(fileId, {
        file: file,
        type: 'Other' // Default type
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
    if (this.applicationForm.valid) {
      this.isSubmitting = true;
  
      try {
        const formValue = this.applicationForm.getRawValue(); // Gets values including disabled controls
        const applicationData = {
          ...formValue,
          department: formValue.department,
          position: formValue.position
        };
  
        const response = await firstValueFrom(this.dataService.submitApplication(applicationData));
  
        if (response && response.success && response.applicantId) {
          const applicantId = response.applicantId;
          
          // Now upload each document sequentially
          for (const [fileId, upload] of this.documentUploads.entries()) {
            const formData = new FormData();
            formData.append('file', upload.file);
            formData.append('applicantId', applicantId.toString());
            formData.append('documentType', upload.type);
  
            try {
              const uploadResponse = await firstValueFrom(this.dataService.uploadDocument(formData));
              // Update progress if needed
              if (uploadResponse && uploadResponse.status === 'progress') {
                upload.progress = uploadResponse.percentage;
              }
            } catch (uploadError) {
              console.error(`Failed to upload document ${upload.file.name}:`, uploadError);
              await Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: `Failed to upload ${upload.file.name}. Please try again.`,
                confirmButtonText: 'OK'
              });
              throw uploadError;
            }
          }
  

          await Swal.fire({
            icon: 'success',
            title: 'Application Submitted',
            text: 'Your application and documents have been submitted successfully.',
            confirmButtonText: 'OK'
          });
  
          this.router.navigate(['/login']);
        } else {
          throw new Error('Failed to get applicant ID');
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
  updateDocumentType(fileId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const type = select.value as DocumentUpload['type'];
    
    const upload = this.documentUploads.get(fileId);
    if (upload) {
      upload.type = type;
      this.documentUploads.set(fileId, upload);
    }
  }
}