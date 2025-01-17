import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const dataService = inject(DataService);
  const routeurl: string = state.url;

  if (dataService.isLoggedIn()) {
    return true; // Allow navigation if logged in
  }

  // Store the attempted URL and redirect to login
  dataService.redirectUrl = routeurl;
  router.navigate(['/login'], { queryParams: { returnUrl: routeurl } });
  return false;
};