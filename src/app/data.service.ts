import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private httpClient: HttpClient, private router: Router) {}

  private baseUrl: string = "http://localhost/4ward/eoportal/eoportalapi/api";
  private uploadBaseUrl: string = "http://localhost/4ward/eoportal/eoportalapi"; // Add this line
  
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
            // Store the full URL in localStorage
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
}