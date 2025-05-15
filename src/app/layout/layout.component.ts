


import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent  {
  corSidebar: 'dark' | 'light' = 'light';

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  shouldShowSidebar(): boolean {
    return this.router.url !== "/login";
  }
}
