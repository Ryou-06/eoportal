import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, throwError, Observable, switchMap, of, retry, timeout} from 'rxjs';

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
  contact_number: string;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  civil_status: string;
  gender: string;
  department: string;
  position: string;
  profile_picture?: string;
  created_at: string;
  status: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface TaskFileSubmission {
  task_id: number;
  files: File[];
  progress: number;
  accomplishment_report: string;
}

export interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_instructions: string | null;
  due_date: string;
  status: TaskStatus;
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
  files?: TaskFile[];
}

export interface TaskFile {
  id: number;
  task_id: number;
  filename: string;
  filepath: string;
  upload_date: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

export interface TaskComment {
  comment_id: number;
  task_id: number;
  admin_username: string;
  comment: string;
  created_at: string;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface TaskUpdateEvent {
  taskId: number;
  progress: number;
  status: TaskStatus;  // Update this to use the TaskStatus type
}

interface ApplicationResponse {
  success: boolean;
  applicantId: number;
  message?: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface Message {
  message_id: number;
  admin_id: number;
  user_id: number;
  message_content: string;
  sent_at: string;
  is_read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private httpClient: HttpClient, private router: Router) {}

  private baseUrl: string = "http://localhost/4ward/eoportal/eoportalapi/api";
private uploadBaseUrl: string = "http://localhost/4ward/eoportal/eoportalapi/api"; // Remove /api
  
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

// In data.service.ts
userLogin(email: string, password: string) {
  return this.httpClient.post<AuthResponse>(`${this.baseUrl}/login.php`, { email, password })
    .pipe(
      map(response => {
        if (response.success && response.user) {
          // Check user status before storing credentials
          if (response.user.status === 'Inactive') {
            throw new Error('Your account is currently inactive. Please contact the administrator.');
          }

          // Store user details only if active
          this.setToken(response.user.email);
          localStorage.setItem('user_id', response.user.user_id.toString());
          localStorage.setItem('fullname', response.user.fullname);
          localStorage.setItem('email', response.user.email);
          localStorage.setItem('contact_number', response.user.contact_number);
          localStorage.setItem('date_of_birth', response.user.date_of_birth);
          localStorage.setItem('place_of_birth', response.user.place_of_birth);
          localStorage.setItem('nationality', response.user.nationality);
          localStorage.setItem('civil_status', response.user.civil_status);
          localStorage.setItem('gender', response.user.gender);
          localStorage.setItem('department', response.user.department);
          localStorage.setItem('position', response.user.position);
          localStorage.setItem('created_at', response.user.created_at);
          localStorage.setItem('status', response.user.status);
          
          if (response.user.profile_picture) {
            localStorage.setItem('profilePicture', response.user.profile_picture);
          }
          
          this.loggedInSubject.next(true);
        }
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login failed:', error);
        let errorMessage = 'An error occurred during login';
        
        if (error.status === 403) {
          errorMessage = 'Your account is currently inactive. Please contact the administrator.';
        } else if (error.error instanceof Object && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          try {
            const parsedError = JSON.parse(error.error.replace(/.*?({.*})/s, '$1'));
            errorMessage = parsedError.message || errorMessage;
          } catch {
            errorMessage = error.error;
          }
        }
        
        return throwError(() => ({
          success: false,
          message: errorMessage
        }));
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
  public updateProfile(
    currentEmail: string, 
    newEmail: string, 
    contactNumber: string, 
    civilStatus: string,
    profilePicture?: File  // Optional parameter using undefined
  ) {
    const formData = new FormData();
    formData.append('currentEmail', currentEmail);
    formData.append('newEmail', newEmail);
    formData.append('contactNumber', contactNumber);
    formData.append('civilStatus', civilStatus);
    
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
            localStorage.setItem('contact_number', contactNumber);
            localStorage.setItem('civil_status', civilStatus);
            
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
    
    // Append task_id, progress, and accomplishment_report
    formData.append('task_id', submission.task_id.toString());
    formData.append('progress', submission.progress.toString());
    formData.append('accomplishment_report', submission.accomplishment_report);
  
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
  
  
  
  fetchTaskFiles(taskId: number): Observable<TaskFile[]> {
    return this.httpClient.get<TaskFileResponse>(
      `${this.baseUrl}/fetchtaskfiles.php`,
      { params: { task_id: taskId.toString() }}
    ).pipe(
      map(response => {
        if (response.success && response.files) {
          console.log('Fetched task files:', response.files);
          return response.files;
        }
        // If no files or success is false, return empty array
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching task files:', error);
        return throwError(() => new Error(error.message || 'Failed to fetch task files'));
      })
    );
  }
  deleteTaskFile(fileId: number): Observable<DeleteFileResponse> {
    return this.httpClient.delete<DeleteFileResponse>(
      `${this.baseUrl}/deletetaskfile.php`,
      {
        params: { file_id: fileId.toString() },
        headers: {
          'Accept': 'application/json'
        }
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Delete file error:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to delete file';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  fetchTaskProgress(taskId: number) {
    return this.httpClient.get<{success: boolean, progress: number}>(
      `${this.baseUrl}/fetchTaskProgress.php`,
      { params: { task_id: taskId.toString() }}
    );
  }
  fetchTaskComments(taskId: number): Observable<TaskComment[]> {
    return this.httpClient.get<{success: boolean, comments: TaskComment[]}>(
      `${this.baseUrl}/fetchcomments.php`,
      { params: { task_id: taskId.toString() }}
    ).pipe(
      map(response => {
        if (response.success && response.comments) {
          return response.comments;
        }
        return [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching comments:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  checkTaskFiles(taskId: number): Observable<{hasFiles: boolean, progress: number}> {
    return this.fetchTaskFiles(taskId).pipe(
      switchMap(files => {
        if (files.length === 0) {
          return of({ hasFiles: false, progress: 0 });
        }
        return this.fetchTaskProgress(taskId).pipe(
          map(progressResponse => ({
            hasFiles: true,
            progress: progressResponse.success ? progressResponse.progress : 0
          })),
          catchError(() => of({ hasFiles: true, progress: 0 }))
        );
      }),
      catchError(() => of({ hasFiles: false, progress: 0 }))
    );
  }

  private getTaskProgress(taskId: number): Observable<number> {
    return this.fetchTaskProgress(taskId).pipe(
      map(response => response.success ? response.progress : 0),
      catchError(() => of(0))
    );
  }

  submitApplication(applicationData: any): Observable<ApplicationResponse> {
    return this.httpClient.post<ApplicationResponse>(
      `${this.baseUrl}/submit-application.php`,
      applicationData
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Application submission failed:', error);
        return throwError(() => error);
      })
    );
  }

  uploadDocument(formData: FormData, retryCount: number = 3): Observable<any> {
    const options = {
        reportProgress: true,
        observe: 'events' as const,
        headers: new HttpHeaders({
            // Remove Content-Type to let browser set it automatically for FormData
            Accept: 'application/json'
        })
    };

    // Log the FormData contents for debugging
    console.log('FormData contents:');
    formData.forEach((value, key) => {
        console.log(`${key}:`, value);
    });

    return this.httpClient.post<any>(
        `${this.baseUrl}/upload-document.php`, 
        formData, 
        options
    ).pipe(
        retry(retryCount),
        map((event: HttpEvent<any>) => {
            switch (event.type) {
                case HttpEventType.UploadProgress:
                    const progress = event.total 
                        ? Math.round(100 * event.loaded / event.total)
                        : 0;
                    return { 
                        status: 'progress', 
                        percentage: progress,
                        loaded: event.loaded,
                        total: event.total 
                    };
                case HttpEventType.Response:
                    if (event.body && event.body.success) {
                        return { 
                            status: 'completed', 
                            data: event.body,
                            files: event.body.files 
                        };
                    } else {
                        throw new Error(event.body?.error || 'Upload failed');
                    }
                default:
                    return { status: 'unknown', data: event };
            }
        }),
        catchError((error: HttpErrorResponse) => {
            console.error('Upload error:', error);
            // Include more detailed error information
            return throwError(() => ({
                error: error.message,
                details: error.error,
                status: error.status,
                timestamp: new Date().toISOString()
            }));
        })
    );
}

uploadDocumentsInChunks(
    files: File[], 
    applicantId: string, 
    documentTypes: string[], 
    chunkSize: number = 3
): Observable<any> {
    return new Observable(observer => {
        let currentChunk = 0;
        const totalChunks = Math.ceil(files.length / chunkSize);

        const uploadNextChunk = () => {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, files.length);
            const chunk = files.slice(start, end);
            const chunkTypes = documentTypes.slice(start, end);

            const formData = new FormData();
            formData.append('applicantId', applicantId);

            // Append files and their types
            chunk.forEach((file, index) => {
                formData.append(`files[]`, file);
                formData.append(`documentTypes[]`, chunkTypes[index]);
            });

            // Log what we're sending
            console.log('Uploading chunk:', {
                currentChunk,
                filesCount: chunk.length,
                types: chunkTypes
            });

            this.uploadDocument(formData)
                .subscribe({
                    next: (response) => {
                        console.log('Chunk upload response:', response);
                        observer.next({
                            status: 'progress',
                            currentChunk: currentChunk + 1,
                            totalChunks,
                            files: response.files,
                            response: response
                        });

                        if (end >= files.length) {
                            observer.complete();
                        } else {
                            currentChunk++;
                            uploadNextChunk();
                        }
                    },
                    error: (error) => {
                        console.error('Chunk upload error:', error);
                        observer.error({
                            error,
                            failedChunk: currentChunk,
                            failedFiles: chunk.map(f => f.name)
                        });
                    }
                });
        };

        uploadNextChunk();
    });
}
  public changePassword(email: string, currentPassword: string, newPassword: string) {
  return this.httpClient.post<ChangePasswordResponse>(
    `${this.baseUrl}/changepassword.php`,
    {
      email: email,
      current_password: currentPassword,
      new_password: newPassword
    }
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Password change failed:', error);
      const errorMessage = error.error?.message || 'Failed to change password';
      return throwError(() => new Error(errorMessage));
    })
  );
}
public fetchUserMessages(userId: number): Observable<Message[]> {
  return this.httpClient.get<{success: boolean, messages: Message[]}>(`${this.baseUrl}/fetchmessages.php`, {
    params: { user_id: userId.toString() }
  }).pipe(
    map(response => {
      if (response.success && response.messages) {
        return response.messages;
      }
      return [];
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('Error fetching messages:', error);
      return throwError(() => new Error(error.message));
    })
  );
}
public markMessageAsRead(messageId: number): Observable<{success: boolean}> {
  return this.httpClient.post<{success: boolean}>(`${this.baseUrl}/markread.php`, {
    message_id: messageId
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error marking message as read:', error);
      return throwError(() => new Error(error.message));
    })
  );
}
}
