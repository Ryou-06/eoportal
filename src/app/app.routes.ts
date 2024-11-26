import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  {
    path: '', // Default route
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '', // Sidenav parent layout
    component: SidenavComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      // Add other child routes here
    ],
  },
  { path: 'login', component: LoginComponent }, // Public route
  { path: 'signup', component: SignupComponent }, // Public route
  {
    path: '**', // Wildcard route for 404s
    redirectTo: '/home',
  },
];
