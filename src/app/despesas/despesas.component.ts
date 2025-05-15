import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-despesas",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./despesas.component.html",
  styleUrls: ["./despesas.component.scss"],
})
export class DespesasComponent implements OnInit {
  despesas: any[] = [];
  categorias: any[] = [];
  cartoes: any[] = [];

  tipoSelecionado: string = "fixa";
  despesaEmEdicaoId: string | null = null;

  novaDespesa = {
    tipo: "fixa",
    descricao: "",
    valor: 0,
    categoria: "",
    cartao: "",
    parcelas: "",
    valorParcela: 0,
    tipoTemporaria: "",
    mesAnoInicio: "",
    mesAnoFim: "",
    data: "",
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
      error: (err) => console.error("Erro ao buscar despesas:", err),
    });
  }

  buscarCategorias(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categorias`).subscribe({
      next: (res) => (this.categorias = res),
      error: (err) => console.error("Erro ao buscar categorias:", err),
    });
  }

  buscarCartoes(): void {
    this.http.get<any[]>(`${environment.apiUrl}/cartoes`).subscribe({
      next: (res) => (this.cartoes = res),
      error: (err) => console.error("Erro ao buscar cartões:", err),
    });
  }

  calcularTotalEFim(): void {
    const valorParcelaNumerico = Number(this.novaDespesa.valorParcela) || 0;
    const parcelas = Number(this.novaDespesa.parcelas) || 0;

    if (parcelas > 0 && valorParcelaNumerico > 0) {
      this.novaDespesa.valor = parcelas * valorParcelaNumerico;
    }

    if (
      this.novaDespesa.mesAnoInicio &&
      this.novaDespesa.mesAnoInicio.length === 5 &&
      parcelas > 0
    ) {
      const [mesStr, anoStr] = this.novaDespesa.mesAnoInicio.split("/");
      const mes = parseInt(mesStr);
      let ano = parseInt(anoStr);

      if (anoStr.length === 2) {
        ano += 2000;
      }

      if (!isNaN(mes) && !isNaN(ano)) {
        const dataInicio = new Date(ano, mes - 1);
        const dataFim = new Date(dataInicio);
        dataFim.setMonth(dataInicio.getMonth() + parcelas - 1);

        const mesFim = (dataFim.getMonth() + 1).toString().padStart(2, "0");
        const anoFim = dataFim.getFullYear().toString().slice(-2);
        this.novaDespesa.mesAnoFim = `${mesFim}/${anoFim}`;
      }
    } else {
      this.novaDespesa.mesAnoFim = "";
    }
  }

  mascararMesAnoInicio(event: any): void {
    let valor = event.target.value.replace(/\D/g, "").slice(0, 4);
    if (valor.length >= 3) {
      valor = valor.slice(0, 2) + "/" + valor.slice(2);
    }
    this.novaDespesa.mesAnoInicio = valor;
    this.calcularTotalEFim();
  }

  registrar(): void {
    if (this.tipoSelecionado === "fixa") {
      const hoje = new Date();
      this.novaDespesa.data = hoje.toISOString().split("T")[0];
      this.novaDespesa.parcelas = "";
      this.novaDespesa.valorParcela = 0;
      this.novaDespesa.tipoTemporaria = "";
      this.novaDespesa.mesAnoInicio = "";
      this.novaDespesa.mesAnoFim = "";
    }

    const url = this.despesaEmEdicaoId
      ? `${this.baseUrl}/${this.despesaEmEdicaoId}`
      : this.baseUrl;

    const requisicao = this.despesaEmEdicaoId
      ? this.http.put(url, { ...this.novaDespesa, tipo: this.tipoSelecionado })
      : this.http.post(url, {
          ...this.novaDespesa,
          tipo: this.tipoSelecionado,
        });

    requisicao.subscribe({
      next: () => {
        this.buscarDespesas();
        alert(
          this.despesaEmEdicaoId
            ? "Despesa atualizada com sucesso!"
            : "Despesa registrada com sucesso!"
        );
      },
      error: (err) => {
        console.error("Erro ao salvar despesa:", err);
        alert("Erro ao salvar despesa!");
      },
    });
  }

  editar(despesa: any): void {
    this.novaDespesa = {
      ...despesa,
      valor: Number(despesa.valor),
      valorParcela: Number(despesa.valorParcela) || 0,
      mesAnoInicio: despesa.mesAnoInicio || "",
      mesAnoFim: despesa.mesAnoFim || "",
    };
    this.tipoSelecionado = despesa.tipo;
    this.despesaEmEdicaoId = despesa.id;
  }

  excluir(id: string): void {
    if (confirm("Deseja excluir esta despesa?")) {
      this.http.delete(`${this.baseUrl}/${id}`).subscribe({
        next: () => {
          this.buscarDespesas();
          alert("Despesa excluída com sucesso!");
        },
        error: (err) => {
          console.error("Erro ao excluir despesa:", err);
          alert("Erro ao excluir despesa!");
        },
      });
    }
  }

  resetarFormulario(): void {
    this.novaDespesa = {
      tipo: "fixa",
      descricao: "",
      valor: 0,
      categoria: "",
      cartao: "",
      parcelas: "",
      valorParcela: 0,
      tipoTemporaria: "",
      mesAnoInicio: "",
      mesAnoFim: "",
      data: "",
    };
    this.tipoSelecionado = "fixa";
    this.despesaEmEdicaoId = null;
  }

  alternarTipo(): void {
    this.novaDespesa.tipo = this.tipoSelecionado;
  }

  calcularTotais(): void {
    const parseValor = (v: any) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const numeros = v.replace(/\D/g, "");
        return Number(numeros) / 100;
      }
      return 0;
    };

    this.totalFixas = this.despesas
      .filter((d) => d.tipo === "fixa")
      .reduce((acc, d) => acc + parseValor(d.valor), 0);

    this.totalTemporarias = this.despesas
      .filter((d) => d.tipo === "temporaria")
      .reduce((acc, d) => acc + parseValor(d.valorParcela), 0);
  }

  aoDigitarValor(valor: string): void {
    const valorNumerico = Number(valor.replace(/\D/g, "")) / 100;
    this.novaDespesa.valor = valorNumerico;
  }

  aoDigitarValorParcela(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorDigitado = input.value.replace(/\D/g, "");
    const valorNumerico = parseFloat(valorDigitado) / 100 || 0;
    this.novaDespesa.valorParcela = valorNumerico;
    this.calcularTotalEFim();
  }

  formatarParaExibicao(valor: number): string {
    if (!valor && valor !== 0) return "-";
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  obterNomeCartao(id: string): string {
    const cartao = this.cartoes.find((c) => c.id === id);
    return cartao ? `${cartao.titular} - ${cartao.instituicao}` : "-";
  }

  formatarParaInput(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
}
