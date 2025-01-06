import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import Swal from 'sweetalert2';

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

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the portal.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteToken();
        this.router.navigate(['/login']);
        Swal.fire('Logged Out', 'You have successfully logged out.', 'success');
      }
    });
  }
}