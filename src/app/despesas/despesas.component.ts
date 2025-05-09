import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.scss']
})
export class DespesasComponent implements OnInit {
  despesas: any[] = [];
  categorias: any[] = [];
  cartoes: any[] = [];

  tipoSelecionado: string = 'fixa';
  despesaEmEdicaoId: string | null = null;

  novaDespesa = {
    tipo: 'fixa',
    descricao: '',
    valor: '',
    categoria: '',
    cartao: '',
    parcelas: '',
    valorParcela: '',
    tipoTemporaria: '',
    mesAnoInicio: '',
    mesAnoFim: ''
  };

  totalFixas: number = 0;
  totalTemporarias: number = 0;

  private readonly baseUrl = `${environment.apiUrl}/despesas`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buscarDespesas();
    this.buscarCategorias();
    this.buscarCartoes();
  }

  buscarDespesas(): void {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (res) => {
        this.despesas = res;
        this.calcularTotais();
        this.resetarFormulario();
      },
      error: (err) => console.error('Erro ao buscar despesas:', err)
    });
  }

  buscarCategorias(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categorias`).subscribe({
      next: (res) => this.categorias = res,
      error: (err) => console.error('Erro ao buscar categorias:', err)
    });
  }

  buscarCartoes(): void {
    this.http.get<any[]>(`${environment.apiUrl}/cartoes`).subscribe({
      next: (res) => this.cartoes = res,
      error: (err) => console.error('Erro ao buscar cartões:', err)
    });
  }

  formatarValorParcela(): void {
    let valor = this.novaDespesa.valorParcela.replace(/\D/g, '');
    valor = (Number(valor) / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    this.novaDespesa.valorParcela = valor ? 'R$ ' + valor : '';
  }

  calcularTotalEFim(): void {
    const valorParcelaNumerico = parseFloat(
      this.novaDespesa.valorParcela
        .replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.')
    );
    const parcelas = Number(this.novaDespesa.parcelas);

    if (!isNaN(parcelas) && !isNaN(valorParcelaNumerico)) {
      const total = parcelas * valorParcelaNumerico;
      
      let totalFormatado = total.toFixed(2).replace('.', ',');
      totalFormatado = totalFormatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      this.novaDespesa.valor = 'R$ ' + totalFormatado;

      const [mes, ano] = this.novaDespesa.mesAnoInicio.split('/').map(v => parseInt(v));
      if (mes && ano && parcelas) {
        const dataFim = new Date(ano + 2000, mes - 1 + parcelas - 1);
        const mesFim = (dataFim.getMonth() + 1).toString().padStart(2, '0');
        const anoFim = dataFim.getFullYear().toString().slice(-2);
        this.novaDespesa.mesAnoFim = `${mesFim}/${anoFim}`;
      }
    }
  }

  mascararMesAnoInicio(event: any): void {
    let valor = event.target.value.replace(/\D/g, '').slice(0, 4);
    if (valor.length >= 3) {
      valor = valor.slice(0, 2) + '/' + valor.slice(2);
    }
    this.novaDespesa.mesAnoInicio = valor;
  }

  formatarParaExibicao(valor: string): string {
    if (!valor) return '-';
    if (valor.includes('R$')) return valor;
    const valorNumerico = parseFloat(valor);
    return isNaN(valorNumerico) ? '-' : 
      'R$ ' + valorNumerico.toFixed(2)
        .replace('.', ',')
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  }

  registrar(): void {
    if (this.tipoSelecionado === 'fixa') {
      this.novaDespesa.parcelas = '';
      this.novaDespesa.valorParcela = '';
      this.novaDespesa.tipoTemporaria = '';
      this.novaDespesa.mesAnoInicio = '';
      this.novaDespesa.mesAnoFim = '';
    }

    const url = this.despesaEmEdicaoId
      ? `${this.baseUrl}/${this.despesaEmEdicaoId}`
      : this.baseUrl;

    const requisicao = this.despesaEmEdicaoId
      ? this.http.put(url, { ...this.novaDespesa, tipo: this.tipoSelecionado })
      : this.http.post(url, { ...this.novaDespesa, tipo: this.tipoSelecionado });

    requisicao.subscribe({
      next: () => {
        this.buscarDespesas();
        alert(this.despesaEmEdicaoId ? 'Despesa atualizada com sucesso!' : 'Despesa registrada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao salvar despesa:', err);
        alert('Erro ao salvar despesa!');
      }
    });
  }

  editar(despesa: any): void {
    this.novaDespesa = { 
      ...despesa,
      valor: this.formatarParaInput(despesa.valor)
    };
    this.tipoSelecionado = despesa.tipo;
    this.despesaEmEdicaoId = despesa.id;
  }

  excluir(id: string): void {
    if (confirm('Deseja excluir esta despesa?')) {
      this.http.delete(`${this.baseUrl}/${id}`).subscribe({
        next: () => {
          this.buscarDespesas();
          alert('Despesa excluída com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao excluir despesa:', err);
          alert('Erro ao excluir despesa!');
        }
      });
    }
  }


  obterNomeCartao(id: string): string {
  const cartao = this.cartoes.find(c => c.id === id);
  return cartao ? `${cartao.titular} - ${cartao.instituicao}` : '-';
}

  resetarFormulario(): void {
    this.novaDespesa = {
      tipo: 'fixa',
      descricao: '',
      valor: '',
      categoria: '',
      cartao: '',
      parcelas: '',
      valorParcela: '',
      tipoTemporaria: '',
      mesAnoInicio: '',
      mesAnoFim: ''
    };
    this.tipoSelecionado = 'fixa';
    this.despesaEmEdicaoId = null;
  }

  alternarTipo(): void {
    this.novaDespesa.tipo = this.tipoSelecionado;
  }

  calcularTotais(): void {
    this.totalFixas = this.despesas
      .filter(d => d.tipo === 'fixa')
      .reduce((total, d) => total + this.parseValor(d.valor), 0);

    this.totalTemporarias = this.despesas
      .filter(d => d.tipo === 'temporaria')
      .reduce((total, d) => total + this.parseValor(d.valorParcela), 0);
  }

  formatarValor(): void {
    let valor = this.novaDespesa.valor.replace(/\D/g, '');
    valor = (Number(valor) / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    this.novaDespesa.valor = valor ? 'R$ ' + valor : '';
  }

  private parseValor(valorString: string): number {
    if (!valorString) return 0;
    const valorNumerico = parseFloat(
      valorString
        .replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.')
    );
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  private formatarParaInput(valorString: string): string {
    if (!valorString) return '';
    return valorString.replace('R$ ', '');
  }
}