import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  sidebarAberta = true;

  toggleSidebar() {
    this.sidebarAberta = !this.sidebarAberta;
  }
}
