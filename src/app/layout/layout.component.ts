


import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  corSidebar: 'dark' | 'light' = 'light';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Simulação de carregamento do tema
    setTimeout(() => {
      this.corSidebar = 'dark';  // ou 'light' conforme lógica
      this.cdr.detectChanges();  // força atualização do DOM
    }, 0);
  }
}
