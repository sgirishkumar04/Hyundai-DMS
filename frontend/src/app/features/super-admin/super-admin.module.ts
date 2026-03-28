import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule }       from '@angular/material/button';
import { MatIconModule }         from '@angular/material/icon';
import { MatChipsModule }        from '@angular/material/chips';
import { MatDialogModule }       from '@angular/material/dialog';
import { MatFormFieldModule }    from '@angular/material/form-field';
import { MatInputModule }        from '@angular/material/input';
import { MatSnackBarModule }     from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule }         from '@angular/material/card';
import { MatTabsModule }         from '@angular/material/tabs';
import { MatTooltipModule }      from '@angular/material/tooltip';
import { MatTableModule }        from '@angular/material/table';
import { MatSelectModule }       from '@angular/material/select';
import { AuthGuard }             from '../../core/guards/auth.guard';
import { SuperAdminComponent }   from './super-admin.component';
import { SuperAdminReportsComponent } from './reports/super-admin-reports.component';
import { AuditLogsComponent }      from './audit-logs/audit-logs.component';
import { BaseChartDirective }    from 'ng2-charts';
import { MatProgressBarModule }  from '@angular/material/progress-bar';
import { MatPaginatorModule }    from '@angular/material/paginator';
import { MatDatepickerModule }   from '@angular/material/datepicker';
import { MatNativeDateModule }   from '@angular/material/core';

@NgModule({
  declarations: [SuperAdminComponent, SuperAdminReportsComponent, AuditLogsComponent],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    RouterModule.forChild([
      { path: '', component: SuperAdminComponent, canActivate: [AuthGuard] },
      { path: 'reports', component: SuperAdminReportsComponent, canActivate: [AuthGuard] },
      { path: 'audit-logs', component: AuditLogsComponent, canActivate: [AuthGuard] }
    ]),
    MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatCardModule,
    MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatTableModule,
    MatSelectModule, MatProgressBarModule, MatPaginatorModule, MatDatepickerModule,
    MatNativeDateModule,
    BaseChartDirective
  ]
})
export class SuperAdminModule {}
