import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard',  loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'employees',  loadChildren: () => import('./features/employees/employees.module').then(m => m.EmployeesModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER'] } },
      { path: 'inventory',  loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule) },
      { path: 'customers',  loadChildren: () => import('./features/customers/customers.module').then(m => m.CustomersModule) },
      { path: 'leads',      loadChildren: () => import('./features/leads/leads.module').then(m => m.LeadsModule) },
      { path: 'sales',      loadChildren: () => import('./features/sales/sales.module').then(m => m.SalesModule) },
      { path: 'service',    loadChildren: () => import('./features/service/service.module').then(m => m.ServiceModule) },
      { path: 'parts',      loadChildren: () => import('./features/parts/parts.module').then(m => m.PartsModule) },
      { path: 'finance',    loadChildren: () => import('./features/finance/finance.module').then(m => m.FinanceModule) },
      { path: 'reports',    loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER', 'ACCOUNTS'] } },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
