import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ThemeService } from "../../services/theme.service";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-receitas",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./receitas.component.html",
  styleUrls: ["./receitas.component.scss"],
})
export class ReceitasComponent implements OnInit {
  receitas: any[] = [];
  receitaEditandoId: string | null = null;

  novaReceita = {
    nome: "",
    tipo: "",
    fonte: "",
    data: "",
    valor: 0,
  };

  valorBr: string = "";
  mostrarFonte = false;

  constructor(private http: HttpClient, private theme: ThemeService) {}

  ngOnInit(): void {
    this.buscarReceitas();
  }

  buscarReceitas() {
    this.http.get<any[]>(`${environment.apiUrl}/receitas`).subscribe({
      next: (res) => (this.receitas = res),
      error: (err) => console.error("Erro ao buscar receitas:", err),
    });
  }

  get totalReceitas(): number {
    return this.receitas.reduce((acc, r) => acc + r.valor, 0);
  }

  registrar() {
    // Ajusta a data para evitar problemas de timezone
    let dataAjustada = this.novaReceita.data;
    if (dataAjustada) {
      // Adiciona o timezone offset para compensar
      const dateObj = new Date(dataAjustada);
      dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
      dataAjustada = dateObj.toISOString().split("T")[0];
    }

    const dados = {
      ...this.novaReceita,
      data: dataAjustada,
      valor: this.desformatarMoeda(this.valorBr),
    };

    const url = `${environment.apiUrl}/receitas`;

    if (this.receitaEditandoId) {
      this.http.put(`${url}/${this.receitaEditandoId}`, dados).subscribe(() => {
        this.resetar();
        this.buscarReceitas();
      });
    } else {
      this.http.post(url, dados).subscribe(() => {
        this.resetar();
        this.buscarReceitas();
      });
    }
  }

  excluir(id: string) {
    if (confirm("Deseja excluir esta receita?")) {
      this.http
        .delete(`${environment.apiUrl}/receitas/${id}`)
        .subscribe(() => this.buscarReceitas());
    }
  }
  editar(r: any) {
    console.log("Receita para editar:", r);
    this.novaReceita = {
      nome: r.nome,
      tipo: r.tipo,
      ...r,
      data: r.data
        ? new Date(r.data + "T00:00:00").toISOString().split("T")[0]
        : "",
      fonte: r.fonte || "",
      valor: r.valor,
    };
    this.valorBr = this.formatarMoeda(r.valor);
    this.mostrarFonte = r.tipo === "outros";
    this.receitaEditandoId = r.id;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  desformatarMoeda(valor: string): number {
    if (!valor) return 0;
    return parseFloat(valor.replace(/\D/g, "").replace(/(\d{2})$/, ".$1")) || 0;
  }

  aoDigitarValor(e: any) {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length === 0) {
      this.valorBr = "";
      return;
    }
    val = (parseFloat(val) / 100).toFixed(2);
    this.valorBr = Number(val).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  toggleFonte(tipo: string) {
    this.mostrarFonte = tipo === "outros";
  }
  formatarData(data: string): string {
    if (!data) return "-";
    const d = new Date(data + "T00:00:00");
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  resetar() {
    this.novaReceita = { nome: "", tipo: "", fonte: "", data: "", valor: 0 };
    this.valorBr = "";
    this.mostrarFonte = false;
    this.receitaEditandoId = null;
  }
}
