import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule }    from '@angular/material/card';
import { MatIconModule }    from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule }  from '@angular/material/button';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    MatCardModule, MatIconModule, MatDividerModule, MatButtonModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables())]
})
export class DashboardModule {}
