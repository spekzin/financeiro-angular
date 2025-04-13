import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cartoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cartoes.component.html',
  styleUrls: ['./cartoes.component.scss']
})
export class CartoesComponent implements OnInit {
  cartoes: any[] = [];
  cartaoEmEdicaoId: string | null = null;

  novoCartao = {
    bandeira: '',
    titular: '',
    vencimento: '',
    melhorDia: '',
    instituicao: ''
  };

  private readonly baseUrl = `${environment.apiUrl}/cartoes`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buscarCartoes();
  }

  buscarCartoes(): void {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (res) => this.cartoes = res,
      error: (err) => console.error('Erro ao buscar cartões:', err)
    });
  }

  salvarCartao(): void {
    if (!this.novoCartao.bandeira.trim() || !this.novoCartao.titular.trim()) return;

    const requisicao = this.cartaoEmEdicaoId
      ? this.http.put(`${this.baseUrl}/${this.cartaoEmEdicaoId}`, this.novoCartao)
      : this.http.post(this.baseUrl, this.novoCartao);

    requisicao.subscribe({
      next: () => {
        this.buscarCartoes();
        this.resetarFormulario();
      },
      error: (err) => console.error('Erro ao salvar cartão:', err)
    });
  }

  editarCartao(cartao: any): void {
    this.novoCartao = { ...cartao };
    this.cartaoEmEdicaoId = cartao.id || cartao._id;
  }

  excluirCartao(id: string): void {
    if (confirm('Deseja excluir este cartão?')) {
      this.http.post(`${this.baseUrl}/delete/${id}`, {}).subscribe({
        next: () => this.buscarCartoes(),
        error: (err) => console.error('Erro ao excluir cartão:', err)
      });
    }
  }

  resetarFormulario(): void {
    this.novoCartao = {
      bandeira: '',
      titular: '',
      vencimento: '',
      melhorDia: '',
      instituicao: ''
    };
    this.cartaoEmEdicaoId = null;
  }
}
