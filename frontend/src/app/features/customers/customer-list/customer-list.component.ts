import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-list',
  template: `
    <div>
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Customers</h1>
          <p>Manage your customer database</p>
        </div>
        <button mat-raised-button style="background:var(--hd-blue);color:#fff"
                *ngIf="canCreate"
                (click)="router.navigate(['/customers/new'])">
          <mat-icon>person_add</mat-icon> Add Customer
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search customers…</mat-label>
            <mat-icon matPrefix style="color:var(--text-muted)">search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Name, email, phone…">
          </mat-form-field>
          <mat-form-field appearance="outline" style="max-width:180px">
            <mat-label>Type</mat-label>
            <mat-select [(value)]="typeFilter" (selectionChange)="applyTypeFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="INDIVIDUAL">Individual</mat-option>
              <mat-option value="CORPORATE">Corporate</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="flex-1"></div>
          <span class="text-sm text-secondary">{{dataSource.filteredData.length}} records</span>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

        <table mat-table [dataSource]="dataSource" matSort class="data-table">

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
            <td mat-cell *matCellDef="let c">
              <span style="font-family:monospace;font-size:.8rem;color:var(--hd-blue)">{{c.customerCode}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
            <td mat-cell *matCellDef="let c">
              <div style="display:flex;align-items:center;gap:10px">
                <div [style.background]="avatarColor(c.firstName)"
                     style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#fff;flex-shrink:0">
                  {{initials(c)}}
                </div>
                <div>
                  <div style="font-weight:600">{{c.firstName}} {{c.lastName}}</div>
                  <div class="text-xs text-secondary">{{c.email}}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let c">{{c.phone}}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let c">
              <span [class]="'badge ' + (c.customerType === 'CORPORATE' ? 'badge-purple' : 'badge-blue')">
                {{c.customerType | titlecase}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="gender">
            <th mat-header-cell *matHeaderCellDef>Gender</th>
            <td mat-cell *matCellDef="let c">{{c.gender | titlecase}}</td>
          </ng-container>

          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let c">
              {{c.addresses?.[0]?.city ?? '—'}}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <div class="action-btns">
                <button *ngIf="canEdit" mat-icon-button matTooltip="Edit" (click)="router.navigate(['/customers', c.id, 'edit'])">
                  <mat-icon style="font-size:18px;color:var(--hd-blue)">edit</mat-icon>
                </button>
                <button *ngIf="canDelete" mat-icon-button matTooltip="Delete" (click)="confirmDelete(c)">
                  <mat-icon style="font-size:18px;color:var(--hd-red)">delete_outline</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          <tr class="mat-mdc-no-data-row" *matNoDataRow>
            <td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">
              <mat-icon>person_search</mat-icon><br>No customers found
            </td>
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['code','name','phone','type','gender','city','actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  searchText = '';
  typeFilter = '';

  private colors = ['#002c5f','#0e7490','#1b8a4a','#6a1b9a','#c2410c','#b91c1c'];

  constructor(private api: ApiService, private dialog: MatDialog,
              private snack: MatSnackBar, public router: Router,
              private auth: AuthService) {}

  get canCreate(): boolean { return this.auth.hasPermission('SALES_CREATE'); }
  get canEdit(): boolean { return this.auth.hasPermission('SALES_EDIT'); }
  get canDelete(): boolean { return this.auth.hasPermission('SALES_DELETE'); }

  ngOnInit() {
    this.dataSource.filterPredicate = (row: any, filterStr: string) => {
      let f: any;
      try { f = JSON.parse(filterStr); } catch(e) { return true; }

      const matchType = !f.type || row.customerType === f.type;
      
      const text = f.text?.toLowerCase() || '';
      let matchText = true;
      if (text) {
        const searchable = [
          row.customerCode,
          row.firstName,
          row.lastName,
          row.email,
          row.phone,
          row.companyName,
          row.panNumber
        ].join(' ').toLowerCase();
        matchText = searchable.includes(text);
      }

      return matchType && matchText;
    };
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getCustomers({ page: 0, size: 200 }).subscribe({
      next: res => {
        this.dataSource.data = res.content ?? [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(e: Event) {
    this.searchText = (e.target as HTMLInputElement).value.trim();
    this.updateFilter();
  }

  applyTypeFilter() {
    this.updateFilter();
  }

  updateFilter() {
    this.dataSource.filter = JSON.stringify({
      text: this.searchText,
      type: this.typeFilter
    });
  }

  initials(c: any): string {
    return ((c.firstName?.[0] ?? '') + (c.lastName?.[0] ?? '')).toUpperCase();
  }

  avatarColor(name: string): string {
    const i = (name?.charCodeAt(0) ?? 0) % this.colors.length;
    return this.colors[i];
  }

  confirmDelete(c: any) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Customer',
        message: `Remove ${c.firstName} ${c.lastName} from the system? All associated leads and bookings may be affected.`,
        confirmText: 'Delete', danger: true
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.deleteCustomer(c.id).subscribe({
        next: () => { this.snack.open('Customer deleted', 'Close', { duration: 3000 }); this.load(); },
        error: () => { this.snack.open('Delete failed', 'Close', { duration: 3000 }); }
      });
    });
  }
}
