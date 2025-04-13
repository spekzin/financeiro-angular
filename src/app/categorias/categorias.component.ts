import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-categorias",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./categorias.component.html",
  styleUrls: ["./categorias.component.scss"],
})
export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  categoriaEditandoId: string | null = null;

  baseUrl = `${environment.apiUrl}/categorias`;

  novaCategoria = {
    nome: "",
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buscarCategorias();
  }

  buscarCategorias(): void {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (res) => (this.categorias = res),
      error: (err) => console.error("Erro ao buscar categorias:", err),
    });
  }

  registrar(): void {
    if (!this.novaCategoria.nome.trim()) return;

    const requisicao = this.categoriaEditandoId
      ? this.http.put(
          `${this.baseUrl}/${this.categoriaEditandoId}`,
          this.novaCategoria
        )
      : this.http.post(this.baseUrl, this.novaCategoria);

    requisicao.subscribe({
      next: () => {
        this.buscarCategorias();
        this.resetarFormulario();
      },
      error: (err) => console.error("Erro ao salvar categoria:", err),
    });
  }

  editar(categoria: any): void {
    this.novaCategoria.nome = categoria.nome;
    this.categoriaEditandoId = categoria.id;
  }

  excluir(id: string): void {
    if (confirm("Deseja excluir esta categoria?")) {
      this.http.delete(`${this.baseUrl}/${id}`).subscribe({
        next: () => this.buscarCategorias(),
        error: (err) => console.error("Erro ao excluir categoria:", err),
      });
    }
  }

  resetarFormulario(): void {
    this.novaCategoria = { nome: "" };
    this.categoriaEditandoId = null;
  }
}
