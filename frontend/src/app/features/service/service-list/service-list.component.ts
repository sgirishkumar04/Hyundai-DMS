import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-list',
  template: `
    <div>
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Service Center</h1>
          <p>Manage service appointments and job cards</p>
        </div>
        <button mat-raised-button style="background:var(--hd-blue);color:#fff"
                (click)="router.navigate(['/service/add'])">
          <mat-icon>add</mat-icon> New Appointment
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search appointments…</mat-label>
            <mat-icon matPrefix style="color:var(--text-muted)">search</mat-icon>
            <input #searchInput matInput (keyup)="applyFilter($event)" placeholder="Appointment no, reg no, customer…">
          </mat-form-field>
          <mat-form-field appearance="outline" style="max-width:200px">
            <mat-label>Service Type</mat-label>
            <mat-select [(value)]="typeFilter" (selectionChange)="applyTypeFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="PERIODIC">Periodic</mat-option>
              <mat-option value="REPAIR">Repair</mat-option>
              <mat-option value="WARRANTY">Warranty</mat-option>
              <mat-option value="ACCIDENTAL">Accidental</mat-option>
              <mat-option value="GENERAL_CHECKUP">General Checkup</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="max-width:180px">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="statusFilter" (selectionChange)="applyStatusFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="SCHEDULED">Scheduled</mat-option>
              <mat-option value="IN_PROGRESS">In Progress</mat-option>
              <mat-option value="COMPLETED">Completed</mat-option>
              <mat-option value="CANCELLED">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="flex-1"></div>
          <span class="text-sm text-secondary">{{dataSource.filteredData.length}} appointments</span>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

        <table mat-table [dataSource]="dataSource" matSort class="data-table">
          <ng-container matColumnDef="no">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Appt #</th>
            <td mat-cell *matCellDef="let s">
              <span style="font-family:monospace;font-size:.8rem;color:var(--hd-blue)">{{s.appointmentNo}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
            <td mat-cell *matCellDef="let s">
              <div style="font-weight:600">{{s.customer?.firstName}} {{s.customer?.lastName}}</div>
              <div class="text-xs text-secondary">{{s.vehicleRegNo}}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="vehicle">
            <th mat-header-cell *matHeaderCellDef>Vehicle</th>
            <td mat-cell *matCellDef="let s">{{s.vehicleVariant?.variantName ?? '—'}}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Service Type</th>
            <td mat-cell *matCellDef="let s">
              <span [class]="'badge ' + typeClass(s.serviceType)">
                {{formatServiceType(s.serviceType)}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Appointment Date</th>
            <td mat-cell *matCellDef="let s">{{s.appointmentDate | date:'dd MMM yyyy, h:mm a'}}</td>
          </ng-container>

          <ng-container matColumnDef="advisor">
            <th mat-header-cell *matHeaderCellDef>Advisor</th>
            <td mat-cell *matCellDef="let s">{{s.appointedBy?.firstName}} {{s.appointedBy?.lastName}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let s">
              <span [class]="'badge ' + statusClass(s.status)">{{s.status | titlecase}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let s">
              <button mat-icon-button matTooltip="Edit" (click)="router.navigate(['/service/edit', s.id])">
                <mat-icon style="font-size:18px;color:var(--hd-blue)">edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          <tr class="mat-mdc-no-data-row" *matNoDataRow>
            <td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">
              <mat-icon>build</mat-icon><br>No appointments found
            </td>
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `
})
export class ServiceListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput!: ElementRef;

  appointments: any[] = [];
  columns = ['no','customer','vehicle','type','date','advisor','status','actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  typeFilter = '';
  statusFilter = '';

  constructor(private api: ApiService, private snack: MatSnackBar, public router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getAppointments({ page: 0, size: 200 }).subscribe({
      next: res => {
        this.dataSource.data = res.content ?? [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.setupFilterPredicate();
        this.loading = false;
      },
      error: (err) => { 
        console.error('Service Load Error:', err);
        this.loading = false; 
      }
    });
  }

  setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: any, filterValue: string) => {
      const filter = JSON.parse(filterValue || '{}');
      
      // 1. Search text filter
      const searchStr = (data.appointmentNo + ' ' + (data.customer?.firstName || '') + ' ' + (data.customer?.lastName || '') + ' ' + (data.vehicleRegNo || '')).toLowerCase();
      const searchMatch = !filter.search || searchStr.includes(filter.search);

      // 2. Type filter
      const typeMatch = !filter.type || data.serviceType === filter.type;

      // 3. Status filter
      const statusMatch = !filter.status || data.status === filter.status;

      return searchMatch && typeMatch && statusMatch;
    };
  }

  applyFilter(e: Event) {
    const search = (e.target as HTMLInputElement).value;
    this.updateFilter();
  }

  applyTypeFilter() { this.updateFilter(); }
  applyStatusFilter() { this.updateFilter(); }

  private updateFilter() {
    const search = this.searchInput?.nativeElement.value || '';
    // We set the filter to a combined string to trigger the predicate
    this.dataSource.filter = JSON.stringify({
      search: search.toLowerCase(),
      type: this.typeFilter,
      status: this.statusFilter
    });
  }

  typeClass(t: string): string {
    const m: Record<string, string> = {
      PERIODIC: 'badge-blue', REPAIR: 'badge-orange',
      WARRANTY: 'badge-purple', ACCIDENTAL: 'badge-red', 
      RECALL: 'badge-orange', GENERAL_CHECKUP: 'badge-cyan'
    };
    return m[t] ?? 'badge-grey';
  }

  formatServiceType(t: string): string {
    return (t ?? '').replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      SCHEDULED: 'badge-yellow', IN_PROGRESS: 'badge-blue',
      COMPLETED: 'badge-green', CANCELLED: 'badge-red'
    };
    return m[s] ?? 'badge-grey';
  }
}
