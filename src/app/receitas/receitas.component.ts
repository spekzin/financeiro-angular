import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.scss']
})
export class ReceitasComponent implements OnInit {
  receitas: any[] = [];
  receitaEditandoId: string | null = null;

  novaReceita = {
    nome: '',
    tipo: '',
    fonte: '',
    valor: 0
  };

  valorBr: string = '';
  mostrarFonte = false;

  constructor(private http: HttpClient, private theme: ThemeService) {}

  ngOnInit(): void {
    this.buscarReceitas();
    
  }

  buscarReceitas() {
    this.http.get<any[]>(`${environment.apiUrl}/receitas`).subscribe({
      next: (res) => (this.receitas = res),
      error: (err) => console.error('Erro ao buscar receitas:', err),
    });
  }

  get totalReceitas(): number {
    return this.receitas.reduce((acc, r) => acc + r.valor, 0);
  }

  registrar() {
    const dados = {
      ...this.novaReceita,
      valor: this.desformatarMoeda(this.valorBr)
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
    if (confirm('Deseja excluir esta receita?')) {
      this.http.delete(`${environment.apiUrl}/receitas/${id}`).subscribe(() => this.buscarReceitas());
    }
  }

  editar(r: any) {
    this.novaReceita = {
      nome: r.nome,
      tipo: r.tipo,
      fonte: r.fonte || '',
      valor: r.valor
    };
    this.valorBr = this.formatarMoeda(r.valor);
    this.mostrarFonte = r.tipo === 'outros';
    this.receitaEditandoId = r.id;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  desformatarMoeda(valor: string): number {
    if (!valor) return 0;
    return parseFloat(valor.replace(/\D/g, '').replace(/(\d{2})$/, '.$1')) || 0;
  }

  aoDigitarValor(e: any) {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length === 0) {
      this.valorBr = '';
      return;
    }
    val = (parseFloat(val) / 100).toFixed(2);
    this.valorBr = Number(val).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  toggleFonte(tipo: string) {
    this.mostrarFonte = tipo === 'outros';
  }

  resetar() {
    this.novaReceita = { nome: '', tipo: '', fonte: '', valor: 0 };
    this.valorBr = '';
    this.mostrarFonte = false;
    this.receitaEditandoId = null;
  }
}
