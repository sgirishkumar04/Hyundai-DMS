import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../core/services/api.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-parts-list',
  template: `
    <div class="animate-fade-in">
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Spare Parts Catalog</h1>
          <p>Track stock levels and manage dealership inventory</p>
        </div>
        <div class="flex gap-2">
          <button mat-raised-button *ngIf="auth.hasPermission('PARTS_CREATE')" style="background:var(--hd-blue);color:#fff" routerLink="/parts/add">
            <mat-icon>add</mat-icon> New Part
          </button>
        </div>
      </div>

      <div class="table-container">
        <div class="table-toolbar" style="padding-bottom: 24px !important; gap: 20px">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-label>Search parts...</mat-label>
            <mat-icon matPrefix style="color:var(--text-muted)">search</mat-icon>
            <input matInput #searchInput (keyup)="applySearch($event)" placeholder="Part #, name, or category...">
          </mat-form-field>

          <button mat-icon-button (click)="resetFilters()" matTooltip="Reset Filters" style="color: var(--text-muted)">
            <mat-icon>refresh</mat-icon>
          </button>

          <mat-form-field appearance="outline" style="max-width:200px" subscriptSizing="dynamic">
            <mat-label>Category</mat-label>
            <mat-select [(value)]="categoryFilter" (selectionChange)="load()">
              <mat-option value="">All Categories</mat-option>
              <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="flex-1"></div>
          <span class="text-sm text-secondary">{{dataSource.data.length}} parts listed</span>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

        <table mat-table [dataSource]="dataSource" matSort class="data-table">
          
          <ng-container matColumnDef="partNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Part # </th>
            <td mat-cell *matCellDef="let p">
              <span style="font-family:monospace;font-size:12px;color:var(--hd-blue);font-weight:600">{{p.partNumber}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Part Details </th>
            <td mat-cell *matCellDef="let p">
              <div style="font-weight:600">{{p.name}}</div>
              <div class="text-xs text-secondary">{{p.category}}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Pricing </th>
            <td mat-cell *matCellDef="let p">
              <div style="font-weight:700">₹{{p.unitPrice | number:'1.2-2'}}</div>
              <div class="text-[10px] text-muted">GST: {{p.gstRate}}%</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="supplier">
            <th mat-header-cell *matHeaderCellDef> Supplier </th>
            <td mat-cell *matCellDef="let p">
              <div style="font-size:13px">{{p.supplier?.name || '—'}}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="text-center"> Status </th>
            <td mat-cell *matCellDef="let p" class="text-center">
              <span [class]="'badge ' + (p.isActive ? 'badge-green' : 'badge-red')">
                {{p.isActive ? 'Active' : 'Inactive'}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right"> Actions </th>
            <td mat-cell *matCellDef="let p" class="text-right action-btns">
              <button mat-icon-button *ngIf="auth.hasPermission('PARTS_EDIT')" [routerLink]="['/parts/edit', p.id]" matTooltip="Edit">
                <mat-icon style="font-size:18px;color:var(--hd-blue)">edit</mat-icon>
              </button>
              <button mat-icon-button *ngIf="auth.hasPermission('PARTS_DELETE')" (click)="deletePart(p)" matTooltip="Delete">
                <mat-icon style="font-size:18px;color:var(--hd-red)">delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-12 text-center" colspan="6" style="padding:40px;color:var(--text-muted)">
              <mat-icon style="font-size:32px;width:32px;height:32px">inventory_2</mat-icon>
              <p>No matching spare parts found.</p>
            </td>
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .action-btns { white-space: nowrap; }
  `]
})
export class PartsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput!: any;

  displayedColumns = ['partNumber', 'name', 'price', 'supplier', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  categories: string[] = ['Brakes', 'Engine', 'Consumables', 'Electrical', 'Body', 'Transmission', 'Accessories'];
  categoryFilter = '';
  searchQuery = '';

  resetFilters() {
    this.searchQuery = '';
    this.categoryFilter = '';
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    this.load();
  }

  constructor(private api: ApiService, private snack: MatSnackBar, private dialog: MatDialog, public auth: AuthService) {}

  ngOnInit() {
    this.load();
    this.api.getPartCategories().subscribe((cats: string[]) => {
      if (cats && cats.length > 0) this.categories = cats;
    });
  }

  load() {
    this.loading = true;
    const params = {
      page: 0,
      size: 100,
      search: this.searchQuery || '',
      category: this.categoryFilter || ''
    };
    this.api.getSpareParts(params).subscribe({
      next: (res: any) => {
        this.dataSource.data = res.content || [];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading parts:', err);
        this.snack.open('Error loading parts catalog. Please check permissions.', 'Close', { duration: 3000 });
      }
    });
  }

  applySearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.load();
  }

  deletePart(part: any) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Spare Part',
        message: `Are you sure you want to remove "${part.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        danger: true
      }
    }).afterClosed().subscribe(ok => {
      if (ok) {
        this.api.deleteSparePart(part.id).subscribe({
          next: () => {
            this.snack.open('Part removed successfully', '✓', { duration: 3000 });
            this.load();
          },
          error: (err) => {
            console.error('Delete failed:', err);
            const msg = err.status === 403 ? 'Access Denied: You cannot delete parts.' : 'Error deleting part';
            this.snack.open(msg, 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
}
