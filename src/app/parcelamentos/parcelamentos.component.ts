import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-parcelamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parcelamentos.component.html',
  styleUrls: ['./parcelamentos.component.scss']
})
export class ParcelamentosComponent implements OnInit {
  novoParcelamento = {
    data: '',
    descricao: '',
    cartao: '',
    parcelas: 1,
    valorParcela: '',
    valorTotal: '',
    inicio: '',
    fim: ''
  };

  parcelamentoEditandoId: string | null = null;
  cartoes: any[] = [];
  parcelamentos: any[] = [];

  constructor(private http: HttpClient, private theme: ThemeService) {}

  ngOnInit(): void {
    this.buscarParcelamentos();
    this.buscarCartoes();
    
  }

  buscarParcelamentos() {
    this.http.get<any[]>(`${environment.apiUrl}/parcelamentos`).subscribe({
      next: (res) => this.parcelamentos = res,
      error: (err) => console.error('Erro ao carregar parcelamentos:', err)
    });
  }

  buscarCartoes() {
    this.http.get<any[]>(`${environment.apiUrl}/cartoes`).subscribe({
      next: (res) => this.cartoes = res,
      error: (err) => console.error('Erro ao carregar cartões:', err)
    });
  }

  get totalParcelasMes(): number {
    return this.parcelamentos.reduce((acc, p) => acc + (p.valorParcela || 0), 0);
  }

  registrar() {
    const data = {
      ...this.novoParcelamento,
      valorParcela: this.desformatarMoeda(this.novoParcelamento.valorParcela),
      valorTotal: this.desformatarMoeda(this.novoParcelamento.valorTotal),
    };

    const url = `${environment.apiUrl}/parcelamentos`;

    if (this.parcelamentoEditandoId) {
      this.http.put(`${url}/${this.parcelamentoEditandoId}`, data).subscribe({
        next: () => {
          this.buscarParcelamentos();
          this.resetarFormulario();
        },
        error: (err) => console.error('Erro ao atualizar parcelamento:', err)
      });
    } else {
      this.http.post(url, data).subscribe({
        next: () => {
          this.buscarParcelamentos();
          this.resetarFormulario();
        },
        error: (err) => console.error('Erro ao registrar parcelamento:', err)
      });
    }
  }

  editar(parcelamento: any) {
    this.novoParcelamento = {
      data: parcelamento.data.slice(0, 10),
      descricao: parcelamento.descricao,
      cartao: parcelamento.cartao,
      parcelas: parcelamento.parcelas,
      valorParcela: this.formatarMoeda(parcelamento.valorParcela),
      valorTotal: this.formatarMoeda(parcelamento.valorTotal),
      inicio: parcelamento.inicio,
      fim: parcelamento.fim
    };
    this.parcelamentoEditandoId = parcelamento.id;
  }

  excluir(id: string) {
    if (confirm('Deseja excluir este parcelamento?')) {
      this.http.delete(`${environment.apiUrl}/parcelamentos/${id}`).subscribe({
        next: () => this.buscarParcelamentos(),
        error: (err) => console.error('Erro ao excluir parcelamento:', err)
      });
    }
  }

  resetarFormulario() {
    this.novoParcelamento = {
      data: '',
      descricao: '',
      cartao: '',
      parcelas: 1,
      valorParcela: '',
      valorTotal: '',
      inicio: '',
      fim: ''
    };
    this.parcelamentoEditandoId = null;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  desformatarMoeda(valor: string): number {
    if (!valor) return 0;
    return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  }

  calcularValores(): void {
    const parcelas = Number(this.novoParcelamento.parcelas);
    const valorParcela = this.desformatarMoeda(this.novoParcelamento.valorParcela);

    if (parcelas > 0 && valorParcela > 0) {
      const total = parcelas * valorParcela;
      this.novoParcelamento.valorTotal = this.formatarMoeda(total);
    }

    if (this.novoParcelamento.inicio.match(/^\d{2}\/\d{2}$/)) {
      const [mes, ano] = this.novoParcelamento.inicio.split('/').map(Number);
      const data = new Date();
      data.setFullYear(2000 + ano, mes - 1 + parcelas - 1, 1);
      const mesFim = String(data.getMonth() + 1).padStart(2, '0');
      const anoFim = String(data.getFullYear()).slice(-2);
      this.novoParcelamento.fim = `${mesFim}/${anoFim}`;
    }
  }

  aplicarMascaraData(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.novoParcelamento.inicio = value;
    this.calcularValores();
  }

  obterNomeCartao(cartaoId: string): string {
    const cartao = this.cartoes.find(c => c.id === cartaoId);
    return cartao ? `${cartao.titular} - ${cartao.instituicao}` : cartaoId;
  }
  aoDigitarValorParcela(event: any): void {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length === 0) {
      this.novoParcelamento.valorParcela = '';
      return;
    }
    val = (parseFloat(val) / 100).toFixed(2);
    this.novoParcelamento.valorParcela = Number(val).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    this.calcularValores(); // já atualiza Total e Fim
  }
  
}
