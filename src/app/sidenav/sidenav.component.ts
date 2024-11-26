import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from "../home/home.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  toggleNav() {
    this.isNavVisible = !this.isNavVisible;
  }

  toggleProfileDropdown() {
    this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
  }
}