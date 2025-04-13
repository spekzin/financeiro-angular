import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private sidebarColor$ = new BehaviorSubject<'light' | 'dark'>('light');

  setColor(cor: 'light' | 'dark') {
    this.sidebarColor$.next(cor);
  }

  getColor() {
    return this.sidebarColor$.asObservable();
  }
}
