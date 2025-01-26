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
  type: DocumentType;
  progress?: number;
}

interface DepartmentPositions {
  [key: string]: string[];
}

type DocumentType = 
  | 'Resume'
  | 'Government-Issued ID'
  | 'Birth Certificate'
  | 'Diploma'
  | 'Transcript of Records'
  | 'Employment Certificate'
  | 'Barangay Clearance'
  | 'Police Clearance'
  | 'NBI Clearance'
  | 'Social Security Documents'
  | 'Tax Identification Number'
  | 'Other'
  | ''; // Add empty string as valid type

  interface UploadError {
    message?: string;
    details?: any;
    status?: number;
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

 requiredDocuments: DocumentType[] = [
  'Resume',
  'Government-Issued ID',
  'Birth Certificate',
  'Diploma',
  'Transcript of Records',
  'Employment Certificate',
  'Barangay Clearance',
  'Police Clearance',
  'NBI Clearance',
  'Social Security Documents',
  'Tax Identification Number'
  ];

  documentTypes: DocumentType[] = [
    'Resume',
    'Government-Issued ID',
    'Birth Certificate',
    'Diploma',
    'Transcript of Records',
    'Employment Certificate',
    'Barangay Clearance',
    'Police Clearance',
    'NBI Clearance',
    'Social Security Documents',
    'Tax Identification Number'
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

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly CHUNK_SIZE = 3; // Number of files to upload at onc

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
      position: [{ value: '', disabled: false }, Validators.required] // Initialize as enabled
    });

    // Subscribe to department changes
    this.applicationForm.get('department')?.valueChanges.subscribe(department => {
      const positionControl = this.applicationForm.get('position');
      
      if (department && positionControl) {
        // Update available positions
        this.availablePositions = this.departmentPositions[department] || [];
        // Enable position control and reset its value
        positionControl.enable();
        positionControl.setValue('');
      } else {
        this.availablePositions = [];
        if (positionControl) {
          positionControl.disable();
          positionControl.setValue('');
        }
      }
    });
  }
  
  isPositionDisabled(): boolean {
    const departmentValue = this.applicationForm.get('department')?.value;
    return !departmentValue;
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
      if (file.size > this.MAX_FILE_SIZE) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: `File "${file.name}" exceeds maximum size of 10MB`
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: `File "${file.name}" is not allowed. Please upload PDF, DOC, DOCX, JPG, or PNG files only.`
        });
        return;
      }

      const fileId = `file-${Date.now()}-${file.name}`;
      this.documentUploads.set(fileId, {
        file: file,
        type: '' // Empty string is now a valid DocumentType
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
    try {
      if (this.applicationForm.invalid) {
        const errors = this.validateForm();
        await Swal.fire({
          icon: 'error',
          title: 'Form Validation Error',
          html: errors.join('<br>')
        });
        return;
      }
  
      this.isSubmitting = true;
  
      // Submit application data
      const formValue = this.applicationForm.getRawValue();
      
      try {
        const response = await firstValueFrom(this.dataService.submitApplication(formValue));
  
        if (response && response.success) {
          // Show success message
          await Swal.fire({
            icon: 'success',
            title: 'Application Submitted',
            text: 'Your application has been successfully submitted!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
  
          // Reset the form
          this.applicationForm.reset();
          
          // Reset document uploads
          this.documentUploads.clear();
          this.documentUploads = new Map();
  
          // Reset department and position
          this.availablePositions = [];
          
          // Optionally scroll to top
          window.scrollTo(0, 0);
        }
      } catch (error: any) {
        if (error.error?.error === 'duplicate_email') {
          await Swal.fire({
            icon: 'error',
            title: 'Email Already Registered',
            text: 'This email address is already registered in our system. Please use a different email address.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
          
          // Optionally, focus on the email field
          const emailInput = document.getElementById('email');
          if (emailInput) {
            emailInput.focus();
          }
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: this.getErrorMessage(error)
          });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: this.getErrorMessage(error)
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  // Add this helper method to safely extract error messages
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'There was an error submitting your application. Please try again.';
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
    const newType = select.value as DocumentType;
    
    const upload = this.documentUploads.get(fileId);
    if (upload && newType) {
      upload.type = newType;
      this.documentUploads.set(fileId, upload);
      
      // Force update of the Map to trigger change detection
      this.documentUploads = new Map(this.documentUploads);
    }
  }
  getMissingRequiredDocuments(): DocumentType[] {
    const uploadedTypes = Array.from(this.documentUploads.values()).map(upload => upload.type);
    return this.requiredDocuments.filter(type => !uploadedTypes.includes(type));
  }


  isDocumentTypeUsed(type: DocumentType): boolean {
    if (!type) return false;
    return Array.from(this.documentUploads.values())
      .some(upload => upload.type === type);
  }


  getAvailableDocumentTypes(currentType: DocumentType): DocumentType[] {
    const usedTypes = new Set(
      Array.from(this.documentUploads.values())
        .map(upload => upload.type)
        .filter(type => type && type !== currentType) // Only filter non-empty types
    );
    
    return this.documentTypes.filter(type => !usedTypes.has(type) || type === currentType);
  }
}