import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ProfileComponent } from './profile/profile.component';
import { UpdateprofileComponent } from './updateprofile/updateprofile.component';
export const routes: Routes = [
  
  {
    path: '', // Default route
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '', // Sidenav parent layout for authenticated routes
    component: SidenavComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'updateprofile', component: UpdateprofileComponent },
      
    ],
  },    
  {
    path: 'login', component: LoginComponent, // Public route
  },
  {
    path: 'signup', component: SignupComponent, // Public route
  },
  {
    path: '**', // Wildcard route for 404s
    redirectTo: '/home',
  },
];
