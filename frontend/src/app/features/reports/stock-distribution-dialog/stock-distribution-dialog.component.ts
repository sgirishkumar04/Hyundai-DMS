import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-stock-distribution-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective
  ],
  template: `
    <h2 mat-dialog-title style="display:flex; align-items:center; justify-content:space-between; margin:0; padding:16px 24px;">
      <span style="display:flex; align-items:center; gap:8px;">
        <mat-icon style="color:var(--hd-blue)">pie_chart</mat-icon> In Stock Distribution by Model
      </span>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content style="padding:24px;">
      <div style="width:100%; min-height:300px;">
        <canvas *ngIf="data.chartData?.labels?.length" baseChart 
                [data]="data.chartData" 
                [options]="data.options" 
                type="bar" 
                style="max-height:400px"></canvas>
        <div *ngIf="!data.chartData?.labels?.length" style="text-align:center; padding:40px; color:var(--text-muted);">
          No stock data available.
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding:16px 24px; margin-bottom:0;">
      <button mat-stroked-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class StockDistributionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StockDistributionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { chartData: ChartData<'bar'>, options: ChartOptions }
  ) {}
}
