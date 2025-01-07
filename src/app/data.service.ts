import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, throwError } from 'rxjs';


export interface UserFile {
  id: number;
  filename: string;
  filepath: string;
  upload_date: string;
  document_type: string;
}

interface User {
  user_id: number;
  fullname: string;
  email: string;
  password: string;
  birthday: string;
  department: string;
  profile_picture?: string; // Add this field
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  profilePicture?: string;  // Add this line to include the profilePicture property
}

export interface TaskFileSubmission {
  task_id: number;
  files: File[];
  progress: number;
}

export interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_instructions: string | null;
  due_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
  created_by: string;
  progress?: number;  // Add progress property
  attachments?: { name: string; url: string; }[];  // Add attachments property
}


export interface TaskWithProgress extends Task {
  progress?: number;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface TaskFileResponse {
  success: boolean;
  message: string;
  files?: {
    id: number;
    filename: string;
    filepath: string;
  }[];
}

export interface TaskFile {
  id: number;
  file_id: number;
  task_id: number;
  filename: string;
  filepath: string;
  upload_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private httpClient: HttpClient, private router: Router) {}

  private baseUrl: string = "http://localhost/4ward/eoportal/eoportalapi/api";
private uploadBaseUrl: string = "http://localhost/4ward/eoportal/eoportalapi"; // Remove /api
  
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn$ = this.loggedInSubject.asObservable();

  public redirectUrl: string = '';

  private setToken(token: string) {
    localStorage.setItem('token', token);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public deleteToken() {
    // Clear all user-related localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email');
    localStorage.removeItem('birthday');
    localStorage.removeItem('department');
    this.loggedInSubject.next(false);
  }

  public isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  public userLogin(email: string, password: string) {
    return this.httpClient.post<User[]>(`${this.baseUrl}/login.php`, { email, password })
      .pipe(
        map(response => {
          if (response && response.length > 0) {
            const user = response[0];
            
            // Store user details in localStorage
            this.setToken(user.email);
            localStorage.setItem('fullname', user.fullname);
            localStorage.setItem('email', user.email);
            localStorage.setItem('birthday', user.birthday);
            localStorage.setItem('department', user.department);
            localStorage.setItem('user_id', user.user_id.toString());
            
            // Store profile picture URL if available
            if (user.profile_picture) {
              localStorage.setItem('profilePicture', user.profile_picture);
            }
            
            this.loggedInSubject.next(true);
            return { success: true, user };
          } else {
            return { success: false, message: 'Invalid email or password' };
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Login failed:', error);
          alert('Login failed. Please try again.');
          return throwError(error);
        })
      );
  }


  public userRegistration(fullname: string, email: string, password: string, birthday: string, department: string) {
    return this.httpClient.post<AuthResponse>(`${this.baseUrl}/register.php`, { fullname, email, password, birthday, department })
      .pipe(
        map(response => {
          console.log('Registration response:', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Registration failed:', error);
          if (error.error && error.error.error === 'Email already exists') {
            alert('This email is already registered.');
          } else {
            alert('Registration failed. Please try again later.');
          }
          return throwError(error);
        })
      );
  }

  public getLoggedInStatus(): boolean {
    return this.loggedInSubject.value;
  }

  // Updated method to update department and email
  public updateProfile(currentEmail: string, newEmail: string, department: string, profilePicture?: File) {
    const formData = new FormData();
    formData.append('currentEmail', currentEmail);
    formData.append('newEmail', newEmail);
    formData.append('department', department);
    
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    return this.httpClient.post<{success: boolean, message: string, profilePicture?: string}>
      (`${this.baseUrl}/updateprofile.php`, formData)
      .pipe(
        map(response => {
          if (response.success) {
            if (newEmail !== currentEmail) {
              localStorage.setItem('email', newEmail);
              this.setToken(newEmail);
            }
            localStorage.setItem('department', department);
            
            // If a new profile picture URL is returned, update localStorage
            if (response.profilePicture) {
              const fullUrl = response.profilePicture.startsWith('http') 
                ? response.profilePicture 
                : `${this.uploadBaseUrl}${response.profilePicture}`;
              localStorage.setItem('profilePicture', fullUrl);
            }
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Profile update failed:', error);
          return throwError(() => error);
        })
      );
  }
  uploadFile(userId: number, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('id', userId.toString());
    formData.append('file', file, file.name);
    formData.append('documentType', documentType); // Add document type
  
    return this.httpClient.post(`${this.baseUrl}/uploadfile.php`, formData, {
      headers: {
        'Accept': 'application/json'
      },
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Upload error:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  fetchUserFiles(userId: number) {
    return this.httpClient.get<File[]>(`${this.baseUrl}/fetchfiles.php`, {
      params: { user_id: userId.toString() },
    });
  }
  deleteFile(fileId: number) {
    return this.httpClient.delete<{success: boolean, message?: string}>(`${this.baseUrl}/deletefile.php`, {
      params: { file_id: fileId.toString() }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Delete file error:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  public getProfilePicture(userId: number) {
    return this.httpClient.get<{success: boolean, profile_picture: string | null}>
      (`${this.baseUrl}/getprofilepicture.php?user_id=${userId}`)
      .pipe(
        map(response => {
          if (response.success && response.profile_picture) {
            // Use the full URL returned from the server
            localStorage.setItem('profilePicture', response.profile_picture);
            return response;
          }
          return { success: false, profile_picture: null };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to fetch profile picture:', error);
          return throwError(() => error);
        })
      );
  }
  fetchUserTasks(userId: number) {
    return this.httpClient.get<Task[]>(`${this.baseUrl}/fetchtasks.php`, {
      params: { user_id: userId.toString() }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching tasks:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  
  submitTaskFiles(submission: TaskFileSubmission) {
    const formData = new FormData();
    formData.append('task_id', submission.task_id.toString());
    formData.append('progress', submission.progress.toString());
    
    // Debug log the files being sent
    console.log('Files to upload:', submission.files);
    
    if (submission.files && submission.files.length > 0) {
      submission.files.forEach((file, index) => {
        console.log(`Appending file ${index}:`, file.name, file.size);
        formData.append(`files[${index}]`, file);
      });
    }

    // Debug log the FormData entries with type assertion
    (Array.from((formData as any).entries()) as [string, FormDataEntryValue][]).forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name}, size: ${value.size}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
  
    return this.httpClient.post<TaskFileResponse>(
      `${this.baseUrl}/submittaskfiles.php`,
      formData
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('File submission error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        
        // Check if there's a more specific error message in the response
        const errorMessage = error.error?.error || error.message || 'An unknown error occurred';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  fetchTaskFiles(taskId: number) {
    return this.httpClient.get<TaskFile[]>(`${this.baseUrl}/fetchtaskfiles.php`, {
      params: { task_id: taskId.toString() },
    }).pipe(
      map(response => {
        console.log('Raw response from fetchTaskFiles:', response);
        return response.map(file => ({
          ...file,
          id: file.id || file.file_id // Use file.id if available, otherwise use file.file_id
        }));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching task files:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  deleteTaskFile(fileId: number) {
    return this.httpClient.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/deletetaskfile.php`,
      { params: { file_id: fileId.toString() } }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Delete file error:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
}