import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.scss'],
})
export class DespesasComponent implements OnInit {
  despesas: any[] = [];
  categorias: any[] = [];
  cartoes: any[] = [];

  tipoSelecionado: 'fixa' | 'temporaria' = 'fixa';

  novaDespesa: any = this.criarNovaDespesa();

  despesaEmEdicaoId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buscarDespesas();
    this.buscarCategorias();
    this.buscarCartoes();
  }

  buscarDespesas() {
    this.http.get<any[]>(`${environment.apiUrl}/despesas`).subscribe({
      next: (res) => (this.despesas = res),
      error: (err) => console.error('Erro ao buscar despesas:', err),
    });
  }

  buscarCategorias() {
    this.http.get<any[]>(`${environment.apiUrl}/categorias`).subscribe({
      next: (res) => (this.categorias = res),
      error: (err) => console.error('Erro ao buscar categorias:', err),
    });
  }

  buscarCartoes() {
    this.http.get<any[]>(`${environment.apiUrl}/cartoes`).subscribe({
      next: (res) => (this.cartoes = res),
      error: (err) => console.error('Erro ao buscar cartões:', err),
    });
  }

  alternarTipo() {
    this.novaDespesa.tipo = this.tipoSelecionado;
  }

  registrar() {
    // localiza o cartão selecionado com base no ID
    const cartaoSelecionado = this.cartoes.find(c => c.id === this.novaDespesa.cartao);
    const nomeCartaoFormatado = cartaoSelecionado
      ? `${cartaoSelecionado.titular} - ${cartaoSelecionado.instituicao}`
      : '';
  
    const dados = {
      ...this.novaDespesa,
      valor: this.desformatarMoeda(this.novaDespesa.valor),
      valorParcela: this.desformatarMoeda(this.novaDespesa.valorParcela),
      cartao: nomeCartaoFormatado, // aqui vai o nome completo ao invés do ID
    };
  
    const requisicao = this.despesaEmEdicaoId
      ? this.http.put(`${environment.apiUrl}/despesas/${this.despesaEmEdicaoId}`, dados)
      : this.http.post(`${environment.apiUrl}/despesas`, dados);
  
    requisicao.subscribe({
      next: () => {
        this.buscarDespesas();
        this.resetar();
      },
      error: (err) => console.error('Erro ao salvar despesa:', err),
    });
  }
  
  editar(d: any) {
    this.tipoSelecionado = d.tipo;
    this.despesaEmEdicaoId = d.id;
  
    // tenta encontrar o ID do cartão com base no nome armazenado
    const cartao = this.cartoes.find(c => `${c.titular} - ${c.instituicao}` === d.cartao);
  
    this.novaDespesa = {
      tipo: d.tipo,
      descricao: d.descricao,
      valor: this.formatarMoeda(d.valor),
      categoria: d.categoria,
      tipoTemporaria: d.tipoTemporaria || '',
      parcelas: d.parcelas || '',
      valorParcela: d.valorParcela ? this.formatarMoeda(d.valorParcela) : '',
      mesAnoInicio: d.mesAnoInicio || '',
      mesAnoFim: d.mesAnoFim || '',
      cartao: cartao?.id || '', // se encontrar o ID, coloca no select
    };
  }

  mascararMesAnoInicio(event: any) {
    let valor = event.target.value.replace(/\D/g, ''); // remove tudo que não for número
  
    if (valor.length >= 3) {
      valor = valor.slice(0, 2) + '/' + valor.slice(2, 4);
    }
  
    this.novaDespesa.mesAnoInicio = valor.slice(0, 5); // garante máximo de 5 caracteres
    this.calcularTotalEFim(); // mantém o comportamento de calcular o fim
  }  
  

  excluir(id: string) {
    if (confirm('Deseja excluir esta despesa?')) {
      this.http
        .delete(`${environment.apiUrl}/despesas/${id}`)
        .subscribe(() => this.buscarDespesas());
    }
  }

  calcularTotalEFim() {
    const parcelas = parseInt(this.novaDespesa.parcelas, 10);
    const valorParcela = this.desformatarMoeda(this.novaDespesa.valorParcela);

    // Calcula valor total
    if (!isNaN(parcelas) && parcelas > 0 && !isNaN(valorParcela)) {
      const total = parcelas * valorParcela;
      this.novaDespesa.valor = this.formatarMoeda(total);
    }

    // Calcula fim (mês/ano)
    if (this.novaDespesa.mesAnoInicio.match(/^\d{2}\/\d{2}$/)) {
      const [mes, ano] = this.novaDespesa.mesAnoInicio.split('/').map(Number);
      const data = new Date(2000 + ano, mes - 1 + parcelas - 1);
      const mesFim = String(data.getMonth() + 1).padStart(2, '0');
      const anoFim = String(data.getFullYear()).slice(-2);
      this.novaDespesa.mesAnoFim = `${mesFim}/${anoFim}`;
    }
  }

  formatarValor() {
    const v = this.novaDespesa.valor.replace(/\D/g, '');
    const formatado = (parseInt(v, 10) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    this.novaDespesa.valor = formatado;
  }

  formatarMoeda(valor: number): string {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  desformatarMoeda(valor: string): number {
    if (!valor) return 0;
    return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  }

  resetar() {
    this.novaDespesa = this.criarNovaDespesa();
    this.despesaEmEdicaoId = null;
  }

  private criarNovaDespesa() {
    return {
      tipo: this.tipoSelecionado,
      descricao: '',
      valor: '',
      categoria: '',
      tipoTemporaria: '',
      parcelas: '',
      valorParcela: '',
      mesAnoInicio: '',
      mesAnoFim: '',
      cartao: '',
    };
  }
}
