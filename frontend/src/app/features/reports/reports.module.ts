import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule }     from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatSelectModule }    from '@angular/material/select';
import { MatCardModule }      from '@angular/material/card';
import { MatSnackBarModule }  from '@angular/material/snack-bar';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { MatTabsModule }      from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ReportsComponent }   from './reports.component';

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: ReportsComponent }]),
    MatCardModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatSnackBarModule, MatTableModule, MatFormFieldModule,
    MatInputModule, MatPaginatorModule, MatTooltipModule,
    MatTabsModule, MatProgressBarModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables())]
})
export class ReportsModule {}

