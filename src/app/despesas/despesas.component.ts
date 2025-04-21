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
  categorias: any[] = []; // Corrigi o nome da propriedade (de 'categorias' para 'categorias')
  cartoes: any[] = [];

  tipoSelecionado: string = 'fixa';
  despesaEmEdicaoId: string | null = null;

  novaDespesa = {
    tipo: '',
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

  registrar(): void {
    const url = this.despesaEmEdicaoId
      ? `${this.baseUrl}/${this.despesaEmEdicaoId}`
      : this.baseUrl;

    const requisicao = this.despesaEmEdicaoId
      ? this.http.put(url, this.novaDespesa)
      : this.http.post(url, this.novaDespesa);

    requisicao.subscribe({
      next: () => {
        this.buscarDespesas();
        this.resetarFormulario();
      },
      error: (err) => console.error('Erro ao salvar despesa:', err)
    });
  }

  editar(despesa: any): void {
    this.novaDespesa = { ...despesa };
    this.tipoSelecionado = despesa.tipo;
    this.despesaEmEdicaoId = despesa.id || despesa._id;
  }

  excluir(id: string): void {
    if (confirm('Deseja excluir esta despesa?')) {
      this.http.post(`${this.baseUrl}/delete/${id}`, {}).subscribe({
        next: () => this.buscarDespesas(),
        error: (err) => console.error('Erro ao excluir despesa:', err)
      });
    }
  }

  resetarFormulario(): void {
    this.novaDespesa = {
      tipo: '',
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
    this.novaDespesa = {
      tipo: this.tipoSelecionado, // Mantém o novo tipo selecionado
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
    this.novaDespesa.tipo = this.tipoSelecionado;
  }

  calcularTotais(): void {
    this.totalFixas = this.despesas
      .filter(d => d.tipo === 'fixa')
      .reduce((total, d) => total + (parseFloat(d.valor) || 0), 0);

    this.totalTemporarias = this.despesas
      .filter(d => d.tipo === 'temporaria')
      .reduce((total, d) => total + (parseFloat(d.valorParcela) || 0), 0);
  }

  formatarValor(): void {
    // Formata o valor para o padrão brasileiro
    let valor = this.novaDespesa.valor.replace(/\D/g, '');
    valor = (Number(valor) / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    this.novaDespesa.valor = valor ? 'R$ ' + valor : '';
  }

  formatarValorParcela(): void {
    // Formata o valor da parcela para o padrão brasileiro
    let valor = this.novaDespesa.valorParcela.replace(/\D/g, '');
    valor = (Number(valor) / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    this.novaDespesa.valorParcela = valor ? 'R$ ' + valor : '';
  }

  calcularTotalEFim(): void {
    // Remove formatação para cálculo
    const valorParcelaNumerico = parseFloat(
      this.novaDespesa.valorParcela
        .replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.')
    );
    const parcelas = Number(this.novaDespesa.parcelas);

    if (!isNaN(parcelas) && !isNaN(valorParcelaNumerico)) {
      const total = parcelas * valorParcelaNumerico;
      
      // Formata o total para o padrão brasileiro
      let totalFormatado = total.toFixed(2).replace('.', ',');
      totalFormatado = totalFormatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      this.novaDespesa.valor = 'R$ ' + totalFormatado;

      // Alinha o valor total à esquerda (removendo text-right se existir no template)
      
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
}