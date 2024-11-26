import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SidenavComponent } from './sidenav/sidenav.component';

export const routes: Routes = [
  {
    path: '',  // Default route, redirects to home
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: SidenavComponent,  // SidenavComponent as the parent layout
    children: [
      { path: '', component: HomeComponent },  // HomeComponent will be injected here
    ],
  },
  { path: 'login', component: LoginComponent },  // Login route, no sidenav
  { path: 'signup', component: SignupComponent },  // Signup route, no sidenav
];
