import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from "../home/home.component";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  isSidebarVisible = true;

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}