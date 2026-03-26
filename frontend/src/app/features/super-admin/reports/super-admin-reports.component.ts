import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { FormBuilder, FormGroup } from '@angular/forms';

interface DealerPerformance { name: string; totalSales: number; totalRevenue: number; }
interface InventoryStatus { status: string; count: number; }
interface LeadVolume { dealerName: string; count: number; }

@Component({
  selector: 'app-super-admin-reports',
  template: `
    <!-- Page Header with Filters -->
    <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom: 24px;">
      <div>
        <h1 style="margin:0; display:flex; align-items:center; gap:8px;"><mat-icon>insights</mat-icon> Network Overview</h1>
        <p style="margin:4px 0 0; color:var(--text-muted)">Across-dealership performance metrics and analytics</p>
      </div>
      <form [formGroup]="filterForm" style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="max-width:130px">
          <mat-label>Year</mat-label>
          <mat-select formControlName="year" (selectionChange)="loadAll()">
            <mat-option [value]="null">All Years</mat-option>
            <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="max-width:145px">
          <mat-label>Month</mat-label>
          <mat-select formControlName="month" (selectionChange)="loadAll()">
            <mat-option [value]="null">All Months</mat-option>
            <mat-option *ngFor="let m of months" [value]="m.value">{{m.label}}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </div>

    <!-- KPI Summary Cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px">
      <mat-card *ngFor="let kpi of kpiCards" style="text-align:center;padding:20px 16px; transition: transform 0.2s, box-shadow 0.2s; border-radius: var(--radius-lg)">
        <mat-icon style="font-size:32px;color:var(--hd-blue);width:32px;height:32px">{{kpi.icon}}</mat-icon>
        <div style="font-size:1.8rem;font-weight:700;color:var(--hd-blue);margin:8px 0 4px">{{kpi.value}}</div>
        <div style="font-size:.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">{{kpi.label}}</div>
      </mat-card>
    </div>

    <!-- Tab Navigation -->
    <mat-tab-group animationDuration="200ms" style="background:var(--surface)">

      <!-- ====== SALES TAB ====== -->
      <mat-tab label="📈 Sales">
        <div style="padding:20px">
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header><mat-card-title>Monthly Network Revenue</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <canvas *ngIf="revenueChart.labels?.length" baseChart [data]="revenueChart" [options]="revenueBarOpts" type="bar" style="max-height:280px"></canvas>
                <div *ngIf="!revenueChart.labels?.length" class="no-data">Loading…</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header><mat-card-title>Monthly Network Sales Count</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <canvas *ngIf="bookingsCountChart.labels?.length" baseChart [data]="bookingsCountChart" [options]="barOpts" type="bar" style="max-height:280px"></canvas>
                <div *ngIf="!bookingsCountChart.labels?.length" class="no-data">Loading…</div>
              </mat-card-content>
            </mat-card>
          </div>

          <mat-card class="hd-card" style="margin-bottom:20px; border-radius: var(--radius-lg)">
            <mat-card-header><mat-card-title>Top Selling Models (Network-Wide)</mat-card-title></mat-card-header>
            <mat-card-content style="padding:16px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
                <canvas *ngIf="topModelsChart.labels?.length" baseChart [data]="topModelsChart" [options]="barOpts" type="bar" style="max-height:280px"></canvas>
                <table mat-table [dataSource]="topModelRows" style="width:100%">
                  <ng-container matColumnDef="model">
                    <th mat-header-cell *matHeaderCellDef>Model</th>
                    <td mat-cell *matCellDef="let r">{{r.model}}</td>
                  </ng-container>
                  <ng-container matColumnDef="bookings">
                    <th mat-header-cell *matHeaderCellDef>Bookings</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.bookings}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="revenue">
                    <th mat-header-cell *matHeaderCellDef>Revenue (₹)</th>
                    <td mat-cell *matCellDef="let r">{{r.revenue | number:'1.0-0'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="topModelCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:topModelCols"></tr>
                </table>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="hd-card" style="margin-bottom:20px; border-radius: var(--radius-lg)">
            <mat-card-header style="margin-bottom: 16px;"><mat-card-title>Dealer Performance Leaderboard</mat-card-title></mat-card-header>
            <mat-card-content style="padding:16px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
                <canvas *ngIf="perfChartData?.labels?.length" baseChart [data]="perfChartData!" [options]="barOpts" type="bar" style="max-height:280px"></canvas>
                <table mat-table [dataSource]="perfRows" style="width:100%">
                  <ng-container matColumnDef="dealer">
                    <th mat-header-cell *matHeaderCellDef>Dealership</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.name}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="sales">
                    <th mat-header-cell *matHeaderCellDef>Total Sales</th>
                    <td mat-cell *matCellDef="let r">{{r.totalSales}}</td>
                  </ng-container>
                  <ng-container matColumnDef="revenue">
                    <th mat-header-cell *matHeaderCellDef>Total Revenue (₹)</th>
                    <td mat-cell *matCellDef="let r">{{r.totalRevenue | number:'1.0-0'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="perfCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:perfCols"></tr>
                </table>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="hd-card" style="margin-bottom:20px; border-radius: var(--radius-lg)">
            <mat-card-header><mat-card-title>Regional Sales Performance (State-Wide)</mat-card-title></mat-card-header>
            <mat-card-content style="padding:16px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
                <canvas *ngIf="regionalChart.labels?.length" baseChart [data]="regionalChart" [options]="barOpts" type="bar" style="max-height:280px"></canvas>
                <table mat-table [dataSource]="regionalRows" style="width:100%">
                  <ng-container matColumnDef="state">
                    <th mat-header-cell *matHeaderCellDef>State / Region</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.state}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="sales">
                    <th mat-header-cell *matHeaderCellDef>Total Sold</th>
                    <td mat-cell *matCellDef="let r">{{r.sales}}</td>
                  </ng-container>
                  <ng-container matColumnDef="revenue">
                    <th mat-header-cell *matHeaderCellDef>Regional Revenue (₹)</th>
                    <td mat-cell *matCellDef="let r">{{r.revenue | number:'1.0-0'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="regionalCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:regionalCols"></tr>
                </table>
              </div>
              <div *ngIf="!regionalRows.length" class="no-data">No regional data available.</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="hd-card" style="margin-bottom:20px; border-radius: var(--radius-lg)">
            <mat-card-header><mat-card-title>Revenue Leakage (Discounts Issued)</mat-card-title></mat-card-header>
            <mat-card-content style="padding:16px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
                <canvas *ngIf="discountChart.labels?.length" baseChart [data]="discountChart" [options]="revenueBarOpts" type="bar" style="max-height:280px"></canvas>
                <table mat-table [dataSource]="discountRows" style="width:100%">
                  <ng-container matColumnDef="month">
                    <th mat-header-cell *matHeaderCellDef>Month</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.month}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="discount">
                    <th mat-header-cell *matHeaderCellDef>Value Discounted (₹)</th>
                    <td mat-cell *matCellDef="let r" style="color:#c62828; font-weight:600">-{{r.discount | number:'1.0-0'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="revenue">
                    <th mat-header-cell *matHeaderCellDef>Net Revenue (₹)</th>
                    <td mat-cell *matCellDef="let r">{{r.revenue | number:'1.0-0'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="discountCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:discountCols"></tr>
                </table>
              </div>
              <div *ngIf="!discountRows.length" class="no-data">No discount metrics available.</div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>


      <!-- ====== INVENTORY TAB ====== -->
      <mat-tab label="🚗 Inventory">
        <div style="padding:20px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header style="margin-bottom: 16px;"><mat-card-title>Network Stock Value by Status</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <canvas *ngIf="invChartData?.labels?.length" baseChart [data]="invChartData!" [options]="pieChartOptions" type="doughnut" style="max-height:280px"></canvas>
                <div *ngIf="!invChartData?.labels?.length" class="no-data">Loading…</div>
              </mat-card-content>
            </mat-card>

            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header><mat-card-title>Inventory Status Summary</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <table mat-table [dataSource]="invRows" style="width:100%">
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let r"><span [class]="'badge ' + statusBadge(r.status)">{{r.status | titlecase}}</span></td>
                  </ng-container>
                  <ng-container matColumnDef="count">
                    <th mat-header-cell *matHeaderCellDef>Quantity</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.count}}</strong></td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="invCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:invCols"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>

          <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
            <mat-card-header><mat-card-title>Network In-Stock Models</mat-card-title></mat-card-header>
            <mat-card-content style="padding:16px">
              <canvas *ngIf="stockByModelChart.labels?.length" baseChart [data]="stockByModelChart" [options]="barOpts" type="bar" style="max-height:280px"></canvas>
              <div *ngIf="!stockByModelChart.labels?.length" class="no-data">Loading…</div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- ====== LEADS TAB ====== -->
      <mat-tab label="🎯 Leads">
        <div style="padding:20px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header><mat-card-title>Network Pipeline Funnel</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <canvas *ngIf="pipelineChart.labels?.length" baseChart [data]="pipelineChart" [options]="hBarOpts" type="bar" style="max-height:320px"></canvas>
                <div *ngIf="!pipelineChart.labels?.length" class="no-data">No leads data available.</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header><mat-card-title>Network Leads by Stage</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <table mat-table [dataSource]="pipelineRows" style="width:100%">
                  <ng-container matColumnDef="stage">
                    <th mat-header-cell *matHeaderCellDef>Stage</th>
                    <td mat-cell *matCellDef="let r">{{r.stage}}</td>
                  </ng-container>
                  <ng-container matColumnDef="count">
                    <th mat-header-cell *matHeaderCellDef>Count</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.count}}</strong></td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="leadStageCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:leadStageCols"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header style="margin-bottom: 16px;"><mat-card-title>Lead Generation by Dealer</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <canvas *ngIf="leadChartData?.labels?.length" baseChart [data]="leadChartData!" [options]="barOpts" type="bar" style="max-height:280px"></canvas>
                <div *ngIf="!leadChartData?.labels?.length" class="no-data">Loading…</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="hd-card" style="border-radius: var(--radius-lg)">
              <mat-card-header><mat-card-title>Dealer Lead Volumes</mat-card-title></mat-card-header>
              <mat-card-content style="padding:16px">
                <table mat-table [dataSource]="leadRows" style="width:100%">
                  <ng-container matColumnDef="dealer">
                    <th mat-header-cell *matHeaderCellDef>Dealership</th>
                    <td mat-cell *matCellDef="let r">{{r.dealerName}}</td>
                  </ng-container>
                  <ng-container matColumnDef="count">
                    <th mat-header-cell *matHeaderCellDef>Total Leads</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.count}}</strong></td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="leadCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:leadCols"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>

        </div>
      </mat-tab>

      <!-- ====== SERVICE TAB ====== -->
      <mat-tab label="🔧 Service">
        <div style="padding:20px">
          <mat-card class="hd-card" style="margin-bottom:20px; border-radius: var(--radius-lg)">
            <mat-card-header><mat-card-title>Service Workload by Dealership</mat-card-title></mat-card-header>
            <mat-card-content style="padding:16px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
                <canvas *ngIf="workloadChart.labels?.length" baseChart [data]="workloadChart" [options]="barOpts" type="bar" style="max-height:280px"></canvas>
                <table mat-table [dataSource]="workloadRows" style="width:100%">
                  <ng-container matColumnDef="dealer">
                    <th mat-header-cell *matHeaderCellDef>Dealership</th>
                    <td mat-cell *matCellDef="let r">{{r.dealer}}</td>
                  </ng-container>
                  <ng-container matColumnDef="jobs">
                    <th mat-header-cell *matHeaderCellDef>Total Jobs</th>
                    <td mat-cell *matCellDef="let r"><strong>{{r.jobs}}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="completed">
                    <th mat-header-cell *matHeaderCellDef>Completed</th>
                    <td mat-cell *matCellDef="let r">{{r.completed}}</td>
                  </ng-container>
                  <ng-container matColumnDef="revenue">
                    <th mat-header-cell *matHeaderCellDef>Revenue (₹)</th>
                    <td mat-cell *matCellDef="let r">{{r.revenue | number:'1.0-0'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="workCols"></tr>
                  <tr mat-row *matRowDef="let r;columns:workCols"></tr>
                </table>
              </div>
              <div *ngIf="!workloadRows.length" class="no-data">No service data available.</div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

    </mat-tab-group>

    <style>
      .no-data { text-align:center; padding:40px; color:var(--text-muted); font-size:.9rem; }
      .badge { display:inline-block; padding:4px 8px; border-radius:12px; font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
      .badge-green { background:#e8f5e9; color:#2e7d32; }
      .badge-blue { background:#e3f2fd; color:#1565c0; }
      .badge-grey { background:#f5f5f5; color:#616161; }
      .badge-purple { background:#f3e5f5; color:#7b1fa2; }
      .badge-yellow { background:#fff8e1; color:#f57f17; }
      .badge-cyan { background:#e0f7fa; color:#0097a7; }
    </style>
  `
})
export class SuperAdminReportsComponent implements OnInit {
  
  filterForm: FormGroup;
  years = [2026, 2025, 2024, 2023];
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  kpiCards: { label: string; value: string; icon: string }[] = [
    { label: 'Active Dealers', value: '0', icon: 'storefront' },
    { label: 'Network Sales', value: '0', icon: 'receipt_long' },
    { label: 'Network Revenue', value: '₹0L', icon: 'account_balance' },
    { label: 'Network Leads', value: '0', icon: 'trending_up' }
  ];

  // --- Charts ---
  revenueChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  bookingsCountChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  topModelsChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  perfChartData?: ChartConfiguration<'bar'>['data'];
  
  regionalChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  discountChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  
  invChartData?: ChartConfiguration<'doughnut'>['data'];
  stockByModelChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  
  pipelineChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  leadChartData?: ChartConfiguration<'bar'>['data'];
  
  workloadChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };

  // --- Tables ---
  perfCols = ['dealer', 'sales', 'revenue'];
  perfRows: DealerPerformance[] = [];

  topModelCols = ['model', 'bookings', 'revenue'];
  topModelRows: any[] = [];
  
  regionalCols = ['state', 'sales', 'revenue'];
  regionalRows: any[] = [];

  discountCols = ['month', 'discount', 'revenue'];
  discountRows: any[] = [];

  invCols = ['status', 'count'];
  invRows: InventoryStatus[] = [];

  leadCols = ['dealer', 'count'];
  leadRows: LeadVolume[] = [];

  leadStageCols = ['stage', 'count'];
  pipelineRows: any[] = [];

  workCols = ['dealer', 'jobs', 'completed', 'revenue'];
  workloadRows: any[] = [];

  // --- Options ---
  barOpts: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
  };

  hBarOpts: ChartOptions<'bar'> = { 
    indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } } 
  };

  revenueBarOpts: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => '₹' + Number(ctx.raw).toLocaleString('en-IN') } }
    },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }, cutout: '65%'
  };

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.filterForm = this.fb.group({ year: [null], month: [null] });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadPerformance();
    this.loadInventory();
    this.loadLeads();
    this.loadService();
  }

  getHttpParams() {
    const { year, month } = this.filterForm.value;
    let params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return params;
  }

  loadPerformance() {
    const params = this.getHttpParams();
    this.http.get<DealerPerformance[]>(`${environment.apiUrl}/dealers/stats/performance`, { params }).subscribe(res => {
      this.perfRows = res;
      this.perfChartData = {
        labels: res.map(r => r.name),
        datasets: [{ data: res.map(r => r.totalSales), backgroundColor: '#002c5f', borderRadius: 4 }]
      };
      
      this.kpiCards[0].value = res.length.toString();
      const tSales = res.reduce((s, r) => s + r.totalSales, 0);
      const tRev = res.reduce((s, r) => s + r.totalRevenue, 0);
      this.kpiCards[1].value = tSales.toString();
      this.kpiCards[2].value = '₹' + (tRev / 100000).toFixed(1) + 'L';
    });

    this.http.get<any[]>(`${environment.apiUrl}/dealers/stats/monthly-sales`, { params }).subscribe(d => {
      const sorted = [...d].reverse();
      this.revenueChart = {
        labels: sorted.map(r => r[0]),
        datasets: [{ data: sorted.map(r => Number(r[2])), label: 'Revenue (₹)', backgroundColor: '#002c5f', borderRadius: 4 }]
      };
      this.bookingsCountChart = {
        labels: sorted.map(r => r[0]),
        datasets: [{ data: sorted.map(r => Number(r[1])), label: 'Bookings', backgroundColor: '#00aad2', borderRadius: 4 }]
      };
    });

    this.http.get<any[]>(`${environment.apiUrl}/dealers/stats/top-models`, { params }).subscribe(d => {
      this.topModelsChart = {
        labels: d.map(r => r[0]),
        datasets: [{ data: d.map(r => Number(r[1])), label: 'Bookings', backgroundColor: '#00aad2', borderRadius: 4 }]
      };
      this.topModelRows = d.map(r => ({ model: r[0], bookings: r[1], revenue: r[2] }));
    });

    this.http.get<any[]>(`${environment.apiUrl}/dealers/stats/regional-sales`, { params }).subscribe(d => {
      this.regionalChart = {
        labels: d.map(r => r[0]),
        datasets: [{ data: d.map(r => Number(r[1])), label: 'Total Sales', backgroundColor: '#00796b', borderRadius: 4 }]
      };
      this.regionalRows = d.map(r => ({ state: r[0], sales: r[1], revenue: r[2] }));
    });

    this.http.get<any[]>(`${environment.apiUrl}/dealers/stats/discount-metrics`, { params }).subscribe(d => {
      const sorted = [...d].reverse();
      this.discountChart = {
        labels: sorted.map(r => r[0]),
        datasets: [
          { data: sorted.map(r => Number(r[1])), label: 'Value Discounted (₹)', backgroundColor: '#c62828', borderRadius: 4 }
        ]
      };
      this.discountRows = sorted.map(r => ({ month: r[0], discount: r[1], revenue: r[2] }));
    });
  }


  loadInventory() {
    const params = this.getHttpParams();
    this.http.get<InventoryStatus[]>(`${environment.apiUrl}/dealers/stats/inventory`, { params }).subscribe(res => {
      this.invRows = res;
      this.invChartData = {
        labels: res.map(r => r.status),
        datasets: [{
          data: res.map(r => r.count),
          backgroundColor: ['#2e7d32', '#1565c0', '#e65100', '#6a1b9a', '#c62828'],
          borderWidth: 0
        }]
      };
    });

    this.http.get<any[]>(`${environment.apiUrl}/dealers/stats/stock-by-model`, { params }).subscribe(d => {
      this.stockByModelChart = {
        labels: d.map(r => r[0]),
        datasets: [{ data: d.map(r => Number(r[1])), label: 'In Stock Units', backgroundColor: '#00aad2', borderRadius: 4 }]
      };
    });
  }

  loadLeads() {
    const params = this.getHttpParams();
    this.http.get<LeadVolume[]>(`${environment.apiUrl}/dealers/stats/leads`, { params }).subscribe(res => {
      this.leadRows = res;
      this.leadChartData = {
        labels: res.map(r => r.dealerName),
        datasets: [{ data: res.map(r => r.count), backgroundColor: '#002c5f', borderRadius: 4 }]
      };
      const tLeads = res.reduce((s, r) => s + r.count, 0);
      this.kpiCards[3].value = tLeads.toString();
    });

    this.http.get<any[]>(`${environment.apiUrl}/dealers/stats/pipeline`, { params }).subscribe(d => {
      this.pipelineChart = {
        labels: d.map(r => r[0]),
        datasets: [{ data: d.map(r => Number(r[1])), label: 'Leads', backgroundColor: '#00aad2', borderRadius: 4 }]
      };
      this.pipelineRows = d.map(r => ({ stage: r[0], count: r[1] }));
    });
  }

  loadService() {
    const params = this.getHttpParams();
    this.http.get<any[]>(`${environment.apiUrl}/dealers/stats/service-workload`, { params }).subscribe(d => {
      this.workloadChart = {
        labels: d.map(r => r[0]),
        datasets: [{ data: d.map(r => Number(r[1])), label: 'Total Jobs', backgroundColor: '#00796b', borderRadius: 4 }]
      };
      this.workloadRows = d.map(r => ({ dealer: r[0], jobs: r[1], completed: r[2], revenue: r[3] }));
    });
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      IN_STOCK: 'badge-green', BOOKED: 'badge-blue', SOLD: 'badge-grey',
      ALLOCATED: 'badge-purple', IN_TRANSIT: 'badge-yellow', DEMO: 'badge-cyan'
    };
    return map[s] ?? 'badge-grey';
  }
}
