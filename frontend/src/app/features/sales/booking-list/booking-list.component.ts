import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-booking-list',
  template: `
    <div>
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Sales Bookings</h1>
          <p>View and manage customer vehicle bookings</p>
        </div>
        <button mat-raised-button style="background:var(--hd-blue);color:#fff"
                *ngIf="canCreate"
                (click)="router.navigate(['/sales/new'])">
          <mat-icon>add</mat-icon> New Booking
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search bookings…</mat-label>
            <mat-icon matPrefix style="color:var(--text-muted)">search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Booking #, customer name…">
          </mat-form-field>

          <mat-form-field appearance="outline" style="max-width:180px; margin-left:12px">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="statusFilter" (selectionChange)="updateFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="BOOKED">Booked</mat-option>
              <mat-option value="ALLOCATED">Allocated</mat-option>
              <mat-option value="INVOICED">Invoiced</mat-option>
              <mat-option value="DELIVERED">Delivered</mat-option>
              <mat-option value="CANCELLED">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="max-width:180px; margin-left:12px">
            <mat-label>Model</mat-label>
            <mat-select [(value)]="modelFilter" (selectionChange)="updateFilter()">
              <mat-option value="">All Models</mat-option>
              <mat-option *ngFor="let m of models" [value]="m.id">
                {{m.modelName}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="max-width:180px; margin-left:12px">
            <mat-label>Sales Exec</mat-label>
            <mat-select [(value)]="execFilter" (selectionChange)="updateFilter()">
              <mat-option value="">All Executives</mat-option>
              <mat-option *ngFor="let m of execs" [value]="m.id">
                {{m.firstName}} {{m.lastName}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="flex-1"></div>
          <span class="text-sm text-secondary">{{dataSource.filteredData.length}} records</span>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

        <table mat-table [dataSource]="dataSource" matSort class="data-table">

          <ng-container matColumnDef="bookingNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Booking #</th>
            <td mat-cell *matCellDef="let b">
              <span style="font-weight:600;color:var(--hd-blue)">{{b.bookingNumber}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let b">{{b.createdAt | date:'dd MMM yyyy'}}</td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let b">
              <div style="font-weight:600">{{b.customer?.firstName}} {{b.customer?.lastName}}</div>
              <div class="text-xs text-secondary">{{b.customer?.phone}}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="vehicle">
            <th mat-header-cell *matHeaderCellDef>Vehicle</th>
            <td mat-cell *matCellDef="let b">
              <div style="font-weight:500">{{b.variant?.model?.modelName}}</div>
              <div class="text-xs text-secondary">{{b.variant?.variantName}} ({{b.color?.name}})</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="executive">
            <th mat-header-cell *matHeaderCellDef>Sales Exec</th>
            <td mat-cell *matCellDef="let b">{{b.salesExec?.firstName}} {{b.salesExec?.lastName}}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Total (On-Road)</th>
            <td mat-cell *matCellDef="let b" style="text-align:right;font-weight:600">
              {{b.totalOnRoad | currency:'INR':'symbol':'1.0-0'}}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let b">
              <span [class]="'badge ' + statusClass(b.status)">{{b.status}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align:center">Actions</th>
            <td mat-cell *matCellDef="let b">
              <div class="action-btns">
                <button mat-icon-button (click)="router.navigate(['/sales', b.id]); $event.stopPropagation()">
                  <mat-icon style="font-size:18px;color:var(--hd-blue)">visibility</mat-icon>
                </button>
                <button *ngIf="canCreate" mat-icon-button (click)="confirmDelete(b); $event.stopPropagation()">
                  <mat-icon style="font-size:18px;color:var(--hd-red)">delete_outline</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="clickable-row"></tr>

          <tr class="mat-mdc-no-data-row" *matNoDataRow>
            <td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">
              No bookings found
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .clickable-row { cursor: pointer; transition: background 0.2s; }
    .clickable-row:hover { background: rgba(0,44,95,.04) !important; }
  `]
})
export class BookingListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['bookingNumber', 'date', 'customer', 'vehicle', 'executive', 'amount', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  searchText = '';
  statusFilter = '';
  execFilter: number | '' = '';
  modelFilter: number | '' = '';
  execs: any[] = [];
  models: any[] = [];

  constructor(private api: ApiService, private dialog: MatDialog,
              private snack: MatSnackBar, public router: Router,
              private auth: AuthService) {}

  get canCreate(): boolean {
    return this.auth.hasPermission('SALES_CREATE') || this.auth.hasPermission('SALES_EDIT');
  }

  ngOnInit() {
    this.dataSource.filterPredicate = (data, filter) => {
      const f = JSON.parse(filter);
      
      const matchStatus = !f.status || data.status === f.status;
      if (!matchStatus) return false;

      const matchExec = !f.exec || data.salesExec?.id === f.exec;
      if (!matchExec) return false;

      const matchModel = !f.model || data.variant?.model?.id === f.model;
      if (!matchModel) return false;

      const text = f.text?.toLowerCase() || '';
      if (!text) return true;

      const searchStr = [
        data.bookingNumber,
        data.customer?.firstName,
        data.customer?.lastName,
        data.variant?.model?.modelName,
        data.variant?.variantName,
        data.salesExec?.firstName,
        data.salesExec?.lastName
      ].join(' ').toLowerCase();

      return searchStr.includes(text);
    };
    this.api.getEmployees({ roleId: 3, size: 100 }).subscribe(res => {
      this.execs = res.content || [];
    });
    this.api.getModels().subscribe(res => {
      this.models = res || [];
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getBookings({ page: 0, size: 200 }).subscribe({
      next: res => {
        this.dataSource.data = res.content || [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.updateFilter();
  }

  updateFilter() {
    this.dataSource.filter = JSON.stringify({
      text: this.searchText,
      status: this.statusFilter,
      exec: this.execFilter,
      model: this.modelFilter
    });
  }

  statusClass(s: string) {
    const map: any = {
      'BOOKED': 'badge-blue',
      'ALLOCATED': 'badge-purple',
      'INVOICED': 'badge-cyan',
      'DELIVERED': 'badge-green',
      'CANCELLED': 'badge-red'
    };
    return map[s] || 'badge-grey';
  }

  confirmDelete(b: any) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Booking',
        message: `Are you sure you want to remove booking ${b.bookingNumber}?`,
        confirmText: 'Delete', danger: true
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.deleteBooking(b.id).subscribe(() => {
        this.snack.open('Booking deleted', 'OK', { duration: 3000 });
        this.load();
      });
    });
  }
}
