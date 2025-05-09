import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { environment } from "../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth/login`;
  private currentUser: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, senha: string) {
    return this.http.post<any>(this.baseUrl, { email, senha }).pipe(
      tap((res) => {
        if (res && res.email) {
          this.currentUser = res;
          localStorage.setItem('user', JSON.stringify(res));
          this.router.navigate(['/setup']);
        } else {
          alert('Email ou senha inválidos');
        }
      })
    );
  }  

  getUser() {
    if (!this.currentUser) {
      this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}