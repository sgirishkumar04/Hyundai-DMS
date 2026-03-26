import { Component, OnInit } from '@angular/core';
import { ApiService }  from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  template: `
    <div>
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Dashboard</h1>
          <p>Welcome back, {{auth.currentUser?.fullName}} — here's your dealership overview</p>
        </div>
        <span class="badge badge-green" style="font-size:.78rem;padding:6px 14px">
          <mat-icon style="font-size:14px;width:14px;height:14px;margin-right:4px">circle</mat-icon>
          Live
        </span>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="!loadingKpi; else kpiSkeleton">
        <div class="kpi-card" [style]="'--kpi-color:#002c5f;--kpi-bg:#e8edf5'">
          <div class="kpi-top">
            <div class="kpi-icon-wrap"><mat-icon>directions_car</mat-icon></div>
            <span class="kpi-trend flat">—</span>
          </div>
          <div class="kpi-value">{{kpi.totalVehicles}}</div>
          <div class="kpi-label">Vehicles in Stock</div>
        </div>

        <div class="kpi-card" [style]="'--kpi-color:#1b8a4a;--kpi-bg:#dcfce7'">
          <div class="kpi-top">
            <div class="kpi-icon-wrap"><mat-icon>sell</mat-icon></div>
          </div>
          <div class="kpi-value">{{kpi.soldMonth}}</div>
          <div class="kpi-label">Vehicles Sold (Month)</div>
        </div>

        <div class="kpi-card" [style]="'--kpi-color:#0e7490;--kpi-bg:#cffafe'">
          <div class="kpi-top">
            <div class="kpi-icon-wrap"><mat-icon>trending_up</mat-icon></div>
          </div>
          <div class="kpi-value">{{kpi.activeLeads}}</div>
          <div class="kpi-label">Total Active Leads</div>
        </div>

        <div class="kpi-card" [style]="'--kpi-color:#e6870a;--kpi-bg:#ffedd5'">
          <div class="kpi-top">
            <div class="kpi-icon-wrap"><mat-icon>build_circle</mat-icon></div>
          </div>
          <div class="kpi-value">{{kpi.serviceTotal}}</div>
          <div class="kpi-label">Active Service Jobs</div>
        </div>

        <div class="kpi-card" [style]="'--kpi-color:#6a1b9a;--kpi-bg:#f3e8ff'">
          <div class="kpi-top">
            <div class="kpi-icon-wrap"><mat-icon>currency_rupee</mat-icon></div>
          </div>
          <div class="kpi-value">{{kpi.revenueMonth | currency:'INR':'symbol':'1.0-0'}}</div>
          <div class="kpi-label">Revenue This Month</div>
        </div>
      </div>

      <ng-template #kpiSkeleton>
        <div class="kpi-grid">
          <div class="kpi-card" *ngFor="let i of [1,2,3,4,5]"
               style="height:120px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite">
          </div>
        </div>
      </ng-template>

      <!-- Charts Row -->
      <div class="charts-grid">
        <!-- Monthly Sales Chart -->
        <div class="card">
          <div class="card-header">
            <h3><mat-icon>bar_chart</mat-icon>Monthly Bookings</h3>
          </div>
          <div class="card-body" style="height:260px">
            <canvas baseChart *ngIf="bookingChart.labels?.length"
                    [data]="bookingChart"
                    [options]="barOptions"
                    type="bar"
                    style="max-height:240px">
            </canvas>
          </div>
        </div>

        <!-- Top Selling Models -->
        <div class="card">
          <div class="card-header">
            <h3><mat-icon>pie_chart</mat-icon>Top Models</h3>
          </div>
          <div class="card-body" style="height:260px;display:flex;align-items:center;justify-content:center">
            <canvas baseChart *ngIf="modelChart.labels?.length"
                    [data]="modelChart"
                    [options]="doughnutOptions"
                    type="doughnut"
                    style="max-height:220px;max-width:220px">
            </canvas>
          </div>
        </div>
      </div>

      <!-- Lower Row -->
      <div class="two-col-grid">
        <!-- Service Workload -->
        <div class="card">
          <div class="card-header">
            <h3><mat-icon>build</mat-icon>Service Workload</h3>
          </div>
          <div class="card-body" style="height:220px">
            <canvas baseChart *ngIf="serviceChart.labels?.length"
                    [data]="serviceChart"
                    [options]="barOptions"
                    type="bar"
                    style="max-height:200px">
            </canvas>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="card">
          <div class="card-header">
            <h3><mat-icon>bolt</mat-icon>Quick Actions</h3>
          </div>
          <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <a *ngFor="let qa of quickActions"
               [routerLink]="qa.route"
               class="quick-action-tile"
               [style.--qa-bg]="qa.bg"
               [style.--qa-border]="qa.color"
               style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 8px;border-radius:10px;background:var(--bg-page);border:1px solid var(--border);text-decoration:none;transition:all .2s;cursor:pointer">
              <mat-icon [style.color]="qa.color" style="font-size:24px;width:24px;height:24px">{{qa.icon}}</mat-icon>
              <span style="font-size:.75rem;font-weight:600;color:var(--text-primary);text-align:center">{{qa.label}}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loadingKpi = true;

  kpi = { totalVehicles: 0, soldMonth: 0, activeLeads: 0, serviceTotal: 0, revenueMonth: 0 };

  bookingChart: ChartData = { labels: [], datasets: [] };
  modelChart:   ChartData = { labels: [], datasets: [] };
  serviceChart: ChartData = { labels: [], datasets: [] };

  barOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
    }
  };

  doughnutOptions: any = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
    cutout: '60%'
  };

  quickActions = [
    { label: 'Add Vehicle',  icon: 'add_circle',  route: '/inventory',  color: '#002c5f', bg: '#e8edf5' },
    { label: 'Add Customer', icon: 'person_add',  route: '/customers',  color: '#0e7490', bg: '#cffafe' },
    { label: 'New Lead',     icon: 'trending_up', route: '/leads',      color: '#1b8a4a', bg: '#dcfce7' },
    { label: 'New Service',  icon: 'build',       route: '/service',    color: '#e6870a', bg: '#ffedd5' },
    { label: 'View Reports', icon: 'bar_chart',   route: '/reports',    color: '#6a1b9a', bg: '#f3e8ff' },
    { label: 'Employees',    icon: 'badge',       route: '/employees',  color: '#b91c1c', bg: '#fee2e2' },
  ];

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loadingKpi = true;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    // Load Leads (Global for KPI, Month-specific for potential chart extensions)
    this.api.getSalesPipeline().subscribe({
      next: (res) => {
        this.kpi.activeLeads = res.filter(r => r[0] !== 'LOST' && r[0] !== 'BOOKED').reduce((acc, curr) => acc + Number(curr[1]), 0);
      },
      error: (err) => { console.error('Dashboard Error:', err); }
    });

    // Load Inventory Pipeline
    this.api.getInventoryStatus().subscribe({
      next: (res) => {
        const inStockRow = res.find(r => r[0] === 'IN_STOCK');
        this.kpi.totalVehicles = inStockRow ? Number(inStockRow[1]) : 0;
      },
      error: (err) => { console.error('Dashboard Error:', err); }
    });

    // Load Service Workload (Global for total jobs, but we still use the month for the chart if we want to)
    this.api.getServiceWorkload(year, month).subscribe({
      next: (res) => {
        // Find total pending service jobs globally (Total jobs in March for now)
        this.kpi.serviceTotal = res.reduce((acc, curr) => acc + Number(curr[1]), 0);
        this.serviceChart = {
          labels: res.map(r => r[0]),
          datasets: [{
            data: res.map(r => Number(r[1])),
            backgroundColor: '#00aad2',
            borderRadius: 4,
            hoverBackgroundColor: '#002c5f'
          }]
        };
      },
      error: (err) => { console.error('Dashboard Error:', err); }
    });

    // Load Monthly Bookings
    this.api.getMonthlyBookings(year).subscribe({
      next: (res) => {
        const chronologicalRes = [...res].reverse();

        this.bookingChart = {
          labels: chronologicalRes.map(r => r[0]),
          datasets: [{
            data: chronologicalRes.map(r => Number(r[1])),
            backgroundColor: '#002c5f',
            borderRadius: 6,
            hoverBackgroundColor: '#00aad2'
          }]
        };

        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const currentMonthData = res.find(r => r[0] === currentMonthStr);
        
        if (currentMonthData) {
           this.kpi.revenueMonth = Number(currentMonthData[2] || 0);
           this.kpi.soldMonth = Number(currentMonthData[1] || 0);
        } else {
           // If no data for current month, it should be 0, not fall back to previous month
           this.kpi.revenueMonth = 0;
           this.kpi.soldMonth = 0;
        }
      },
      error: (err) => { console.error('Dashboard Error:', err); }
    });

    // Load Top Models (Yearly instead of Monthly to avoid empty charts)
    this.api.getTopSellingModels(year).subscribe({
      next: (res) => {
        this.modelChart = {
          labels: res.map(r => r[0]),
          datasets: [{
            data: res.map(r => Number(r[1])),
            backgroundColor: ['#002c5f', '#00aad2', '#1b8a4a', '#e6870a', '#6a1b9a', '#c00f2f', '#f59e0b', '#10b981'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };
      },
      error: (err) => { console.error('Dashboard Error:', err); }
    });

    setTimeout(() => this.loadingKpi = false, 500);
  }
}
