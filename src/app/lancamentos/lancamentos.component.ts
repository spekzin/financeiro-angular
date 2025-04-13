import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.scss'],
})
export class LancamentosComponent implements OnInit {
  lancamentos: any[] = [];
  cartoes: any[] = [];

  novoLancamento: any = {
    data: '',
    descricao: '',
    cartao: '',
    valor: '',
  };

  lancamentoEmEdicaoId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buscarCartoes();
    this.buscarLancamentos();
  }

  buscarCartoes() {
    this.http.get<any[]>(`${environment.apiUrl}/cartoes`).subscribe({
      next: (res) => this.cartoes = res,
      error: (err) => console.error('Erro ao buscar cartões:', err)
    });
  }

  buscarLancamentos() {
    this.http.get<any[]>(`${environment.apiUrl}/lancamentos`).subscribe({
      next: (res) => this.lancamentos = res,
      error: (err) => console.error('Erro ao buscar lançamentos:', err)
    });
  }

  registrar() {
    const dados = {
      ...this.novoLancamento,
      valor: this.desformatarMoeda(this.novoLancamento.valor)
    };

    const req = this.lancamentoEmEdicaoId
      ? this.http.put(`${environment.apiUrl}/lancamentos/${this.lancamentoEmEdicaoId}`, dados)
      : this.http.post(`${environment.apiUrl}/lancamentos`, dados);

    req.subscribe({
      next: () => {
        this.buscarLancamentos();
        this.resetarFormulario();
      },
      error: (err) => console.error('Erro ao salvar lançamento:', err)
    });
  }

  editar(reg: any) {
    this.lancamentoEmEdicaoId = reg.id;
    this.novoLancamento = {
      data: reg.data.split('T')[0],
      descricao: reg.descricao,
      cartao: reg.cartao,
      valor: this.formatarMoeda(reg.valor)
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluir(id: string) {
    if (confirm('Deseja excluir este lançamento?')) {
      this.http.delete(`${environment.apiUrl}/lancamentos/${id}`).subscribe(() => this.buscarLancamentos());
    }
  }

  formatarMoeda(valor: number): string {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  desformatarMoeda(valor: string): number {
    if (!valor) return 0;
    return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  }

  formatarValor() {
    const v = this.novoLancamento.valor.replace(/\D/g, '');
    this.novoLancamento.valor = (parseInt(v, 10) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  obterCartaoNome(cartaoId: string): string {
    const cartao = this.cartoes.find(c => c.id === cartaoId);
    return cartao ? `${cartao.titular} - ${cartao.instituicao}` : '-';
  }

  formatarData(data: string): string {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  calcularTotal(): number {
    return this.lancamentos.reduce((acc, cur) => acc + cur.valor, 0);
  }
  

  resetarFormulario() {
    this.novoLancamento = {
      data: '',
      descricao: '',
      cartao: '',
      valor: ''
    };
    this.lancamentoEmEdicaoId = null;
  }
}
