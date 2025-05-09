import { Component, OnInit } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
// ... (resto igual)
@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  email = "";
  senha = "";
  carregando = false;
  private baseUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const user = localStorage.getItem("user");
    if (user) {
      localStorage.removeItem("user"); // ou localStorage.clear();
    }
  }

  login() {
    if (!this.email || !this.senha) {
      alert("Por favor, preencha o e-mail e a senha.");
      return;
    }

    this.carregando = true;

    this.http
      .post(this.baseUrl, {
        email: this.email,
        password: this.senha,
      })
      .subscribe({
        next: (res: any) => {
          this.carregando = false;

          if (res && res.email) {
            localStorage.setItem("user", JSON.stringify(res));
            this.router.navigate(["/lancamentos"]);
          } else {
            alert("E-mail ou senha inválidos.");
          }
        },
        error: (err) => {
          this.carregando = false;
          alert("Erro ao tentar logar. Verifique se a API está online.");
          console.error("Erro de login:", err);
        },
      });
  }
}
