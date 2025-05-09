import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component'; // certifique-se de importar corretamente
import { CartoesComponent } from './cartoes/cartoes.component';
import { ParcelamentosComponent } from './parcelamentos/parcelamentos.component';
import { ReceitasComponent } from './receitas/receitas.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { DespesasComponent } from './despesas/despesas.component';
import { LancamentosComponent } from './lancamentos/lancamentos.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'parcelamentos', pathMatch: 'full' },
      { path: 'cartoes', component: CartoesComponent, canActivate: [AuthGuard] },
      { path: 'parcelamentos', component: ParcelamentosComponent, canActivate: [AuthGuard] },
      { path: 'receitas', component: ReceitasComponent, canActivate: [AuthGuard] },
      { path: 'categorias', component: CategoriasComponent, canActivate: [AuthGuard] },
      { path: 'despesas', component: DespesasComponent, canActivate: [AuthGuard] },
      { path: 'login', component: LoginComponent},
      { path: 'lancamentos', component: LancamentosComponent, canActivate: [AuthGuard] },
    ]
  }
];
