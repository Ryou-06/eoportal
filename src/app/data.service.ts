import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
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
  user?: User; // The user data should be stored here
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private httpClient: HttpClient, private router: Router) {}

  private baseUrl: string = "http://localhost/eoportal/api";
  
  // Maintain a BehaviorSubject to track login status
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn$ = this.loggedInSubject.asObservable();

  // Property to store the redirect URL after login
  public redirectUrl: string = ''; // Add this property

  // Token management
  private setToken(token: string) {
    localStorage.setItem('token', token);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public deleteToken() {
    localStorage.removeItem('token');
    this.loggedInSubject.next(false); // Update login status
  }

  public isLoggedIn(): boolean {
    return this.getToken() !== null;  // Checks if a token is stored in localStorage
  }

  // Login method with proper error handling
  public userLogin(email: string, password: string) {
    console.log('Login request:', { email, password });  // Debugging line
    return this.httpClient.post<User[]>(`${this.baseUrl}/login.php`, { email, password })
      .pipe(
        map(response => {
          console.log('Login response received:', response); // Log the response
  
          // Check if we received a user in the response array
          if (response && response.length > 0) {
            const user = response[0]; // Extract user data from the array
            this.setToken(user.email);  // Store the user's email (or token) in localStorage
            this.loggedInSubject.next(true);  // Emit true for successful login
            return { success: true, user };  // Return a successful response with user data
          } else {
            return { success: false, message: 'Invalid email or password' };  // Handle invalid login
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Login failed:', error);
          alert('Login failed. Please try again.');
          return throwError(error);  // Return an observable error
        })
      );
  }
  

  // Registration method with error handling
  public userRegistration(fullname: string, email: string, password: string, birthday: string, department: string) {
    return this.httpClient.post<AuthResponse>(`${this.baseUrl}/register.php`, { fullname, email, password, birthday, department })
      .pipe(
        map(response => {
          console.log('Registration response:', response);  // Log the response for debugging
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

  // Get the current logged-in status (BehaviorSubject will reflect this state)
  public getLoggedInStatus(): boolean {
    return this.loggedInSubject.value;
  }
}