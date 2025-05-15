import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  NgFor,
  NgIf,
} from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import Chart from "chart.js/auto";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    CurrencyPipe,
    DatePipe,
    NgFor,
    NgIf,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild("graficoCanvas") graficoCanvas!: ElementRef<HTMLCanvasElement>;

  totalReceitas = 0;
  totalFixas = 0;
  totalTemporarias = 0;
  totalParcelamentos = 0;
  totalLancamentos = 0;
  saldoMensal = 0;

  ultimosLancamentos: any[] = [];
  categoriasLabels: string[] = [];
  categoriasValues: number[] = [];
  categoriasCores: string[] = [];

  dadosCarregados = false;

   private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarDashboard();
  }

  ngAfterViewInit(): void {
    if (this.dadosCarregados) {
      this.renderizarGrafico();
    }
  }

  carregarDashboard(): void {
    this.http.get<any>(`${environment.apiUrl}/dashboard`).subscribe((data) => {
      console.log("Dados recebidos do backend:", data);
      if (!data) return;

      this.totalReceitas = data.totalReceitas || 0;
      this.totalFixas = data.totalFixas || 0;
      this.totalTemporarias = data.totalTemporarias || 0;
      this.totalParcelamentos = data.totalParcelamentos || 0;
      this.totalLancamentos = data.totalLancamentos || 0;
      this.saldoMensal = data.saldoMensal || 0;
      this.ultimosLancamentos = data.ultimosLancamentos || [];

      this.gerarDadosGrafico(this.ultimosLancamentos);
      this.dadosCarregados = true;
      this.cdr.detectChanges();
      this.renderizarGrafico();
    });
  }
  gerarDadosGrafico(lancamentos: any[]) {
    const categoriasMap = new Map<string, number>();

    lancamentos.forEach((lanc) => {
      const categoria = lanc.categoria || "Outros";
      const valor = lanc.tipo === 'temporaria' ? lanc.valorParcela : lanc.valor || 0;

      if (categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, categoriasMap.get(categoria)! + valor);
      } else {
        categoriasMap.set(categoria, valor);
      }
    });

    this.categoriasLabels = Array.from(categoriasMap.keys());
    this.categoriasValues = Array.from(categoriasMap.values());

    // Cores fixas ou geradas dinamicamente
    this.categoriasCores = [
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#6366F1",
      "#8B5CF6",
      "#EC4899",
      "#F97316",
      "#22D3EE",
      "#14B8A6",
    ].slice(0, this.categoriasLabels.length);
  }

  renderizarGrafico(): void {
    if (!this.graficoCanvas) return;
    const ctx = this.graficoCanvas.nativeElement.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: this.categoriasLabels,
        datasets: [
          {
            data: this.categoriasValues,
            backgroundColor: this.categoriasCores,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { position: "left" },
        },
      },
    });
  }
}
