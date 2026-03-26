import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, RoleGuard, LoginGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule), canActivate: [LoginGuard] },
  { path: 'register', redirectTo: 'login/register', pathMatch: 'full' },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard',  loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'super-admin', loadChildren: () => import('./features/super-admin/super-admin.module').then(m => m.SuperAdminModule),
        canActivate: [RoleGuard], data: { roles: ['SUPER_ADMIN'] } },
      { path: 'employees',  loadChildren: () => import('./features/employees/employees.module').then(m => m.EmployeesModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER'], permission: 'EMPLOYEES_VIEW' } },
      { path: 'inventory',  loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'INVENTORY_MANAGER'], permission: 'INVENTORY_VIEW' } },
      { path: 'customers',  loadChildren: () => import('./features/customers/customers.module').then(m => m.CustomersModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'ACCOUNTS'], permission: 'SALES_VIEW' } },
      { path: 'leads',      loadChildren: () => import('./features/leads/leads.module').then(m => m.LeadsModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'], permission: 'SALES_VIEW' } },
      { path: 'sales',      loadChildren: () => import('./features/sales/sales.module').then(m => m.SalesModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'ACCOUNTS'], permission: 'SALES_VIEW' } },
      { path: 'service',    loadChildren: () => import('./features/service/service.module').then(m => m.ServiceModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SERVICE_ADVISOR', 'MECHANIC'], permission: 'SERVICE_VIEW' } },
      { path: 'parts',      loadChildren: () => import('./features/parts/parts.module').then(m => m.PartsModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'INVENTORY_MANAGER', 'SERVICE_ADVISOR', 'MECHANIC'], permission: 'PARTS_VIEW' } },
      { path: 'finance',    loadChildren: () => import('./features/finance/finance.module').then(m => m.FinanceModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'ACCOUNTS', 'SALES_MANAGER'] } },
      { path: 'reports',    loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        canActivate: [RoleGuard], data: { roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'ACCOUNTS'], permission: 'REPORTS_VIEW' } },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
