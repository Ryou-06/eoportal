import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from "../home/home.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
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