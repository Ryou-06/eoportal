import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { Router, RouterOutlet } from '@angular/router';
import { HomeComponent } from "../home/home.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../data.service';
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {

  isNavVisible = true;
  isProfileDropdownVisible = false;

  constructor(private router: Router, private dataService: DataService) {}

  toggleNav() {
    this.isNavVisible = !this.isNavVisible;
  }

  toggleProfileDropdown() {
    this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
  }

  // Logout function
  logout() {
    this.dataService.deleteToken();  // Assuming deleteToken is implemented in your DataService
    this.router.navigate(['/login']);  // Redirect to the login page
  }
}