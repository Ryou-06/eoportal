import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';

// Use the `CanActivateFn` type
export const authGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router); // Inject Router
  const dataService = inject(DataService); // Inject DataService

  const routeurl: string = state.url;

  // Check if the user is logged in
  if (dataService.isLoggedIn()) {
    // If there's a stored returnUrl, redirect the user there
    const returnUrl = dataService.redirectUrl || '/home';  // Default to /home if no returnUrl
    router.navigate([returnUrl]);  // Redirect user to the target page
    return false;  // Prevent navigation here, since it's handled
  }

  // Store the attempted URL and redirect to the login page
  dataService.redirectUrl = routeurl;
  router.navigate(['/login'], { queryParams: { returnUrl: routeurl } });

  return false; // Prevent navigation if not logged in
};