import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, throwError } from 'rxjs';

interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
  birthday: string;
  department: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private httpClient: HttpClient, private router: Router) {}

  private baseUrl: string = "http://localhost/eoportal/api";
  
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
  public updateProfile(currentEmail: string, newEmail: string, department: string) {
    return this.httpClient.post<AuthResponse>(`${this.baseUrl}/updateprofile.php`, { 
      currentEmail, 
      newEmail, 
      department 
    })
    .pipe(
      map(response => {
        console.log('Update profile response:', response);
        
        // If update is successful, update localStorage
        if (response.success) {
          if (newEmail !== currentEmail) {
            localStorage.setItem('email', newEmail);
            // Update token with new email
            this.setToken(newEmail);
          }
          localStorage.setItem('department', department);
        }
        
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Profile update failed:', error);
        
        // More specific error handling
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('Failed to update profile. Please try again.');
        }
        
        return throwError(error);
      })
    );
  }
}