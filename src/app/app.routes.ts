import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component'; // certifique-se de importar corretamente
import { CartoesComponent } from './cartoes/cartoes.component';
import { ParcelamentosComponent } from './parcelamentos/parcelamentos.component';
import { ReceitasComponent } from './receitas/receitas.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { DespesasComponent } from './despesas/despesas.component';
import { LancamentosComponent } from './lancamentos/lancamentos.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'parcelamentos', pathMatch: 'full' },
      { path: 'cartoes', component: CartoesComponent },
      { path: 'parcelamentos', component: ParcelamentosComponent },
      { path: 'receitas', component: ReceitasComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'despesas', component: DespesasComponent },
      { path: 'lancamentos', component: LancamentosComponent },
    ]
  }
];
