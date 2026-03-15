import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lead-list',
  template: `
    <div>
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Leads & Enquiries</h1>
          <p>Track and manage your sales pipeline</p>
        </div>
        <button mat-raised-button style="background:var(--hd-blue);color:#fff"
                (click)="router.navigate(['/leads/new'])">
          <mat-icon>add</mat-icon> New Lead
        </button>
      </div>

      <!-- Funnel summary chips -->
      <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
        <div *ngFor="let s of stages"
             class="card"
             style="padding:12px 20px;display:flex;flex-direction:column;align-items:center;min-width:110px;cursor:pointer;transition:all .2s"
             [style.border-top]="'3px solid ' + s.color"
             (click)="filterByStage(s.key)">
          <div style="font-size:1.4rem;font-weight:800" [style.color]="s.color">{{stageCounts[s.key] || 0}}</div>
          <div style="font-size:.72rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em">{{s.label}}</div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search leads…</mat-label>
            <mat-icon matPrefix style="color:var(--text-muted)">search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Lead no, customer, model…">
          </mat-form-field>
          <mat-form-field appearance="outline" style="max-width:180px">
            <mat-label>Stage</mat-label>
            <mat-select [(value)]="stageFilter" (selectionChange)="filterByStage(stageFilter)">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let s of stages" [value]="s.key">{{s.label}}</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="flex-1"></div>
          <span class="text-sm text-secondary">{{dataSource.filteredData.length}} leads</span>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

        <table mat-table [dataSource]="dataSource" matSort class="data-table">
          <ng-container matColumnDef="number">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Lead #</th>
            <td mat-cell *matCellDef="let l">
              <span style="font-family:monospace;font-size:.8rem;color:var(--hd-blue)">{{l.leadNumber}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
            <td mat-cell *matCellDef="let l">
              <div style="font-weight:600">{{l.customer?.firstName}} {{l.customer?.lastName}}</div>
              <div class="text-xs text-secondary">{{l.customer?.phone}}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="model">
            <th mat-header-cell *matHeaderCellDef>Interested In</th>
            <td mat-cell *matCellDef="let l">
              <div>{{l.preferredModel?.modelName ?? '—'}}</div>
              <div class="text-xs text-secondary">{{l.preferredVariant?.variantName}}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="source">
            <th mat-header-cell *matHeaderCellDef>Source</th>
            <td mat-cell *matCellDef="let l">
              <span class="badge badge-cyan">{{l.source?.name ?? '—'}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>Assigned To</th>
            <td mat-cell *matCellDef="let l">{{l.assignedTo?.firstName}} {{l.assignedTo?.lastName}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Stage</th>
            <td mat-cell *matCellDef="let l">
              <span [class]="'badge ' + stageClass(l.status)">{{l.status | titlecase}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let l">
              <div class="action-btns">
                <button mat-icon-button matTooltip="Edit" (click)="router.navigate(['/leads', l.id, 'edit'])">
                  <mat-icon style="font-size:18px;color:var(--hd-blue)">edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete" (click)="confirmDelete(l)">
                  <mat-icon style="font-size:18px;color:var(--hd-red)">delete_outline</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          <tr class="mat-mdc-no-data-row" *matNoDataRow>
            <td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">
              <mat-icon>inbox</mat-icon><br>No leads found
            </td>
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `
})
export class LeadListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['number','customer','model','source','assignedTo','status','actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  stageFilter = '';
  stageCounts: Record<string, number> = {};

  stages = [
    { key: 'NEW',         label: 'New',       color: '#002c5f' },
    { key: 'CONTACTED',   label: 'Contacted', color: '#0e7490' },
    { key: 'TEST_DRIVE',  label: 'Test Drive',color: '#e6870a' },
    { key: 'NEGOTIATION', label: 'Negotiation',color:'#6a1b9a' },
    { key: 'BOOKED',      label: 'Booked',    color: '#1b8a4a' },
    { key: 'LOST',        label: 'Lost',      color: '#b91c1c' },
  ];

  constructor(private api: ApiService, private dialog: MatDialog,
              private snack: MatSnackBar, public router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getLeads({ page: 0, size: 500 }).subscribe({
      next: res => {
        const data = res.content ?? [];
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.stageCounts = {};
        data.forEach((l: any) => { this.stageCounts[l.status] = (this.stageCounts[l.status] || 0) + 1; });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(e: Event) {
    this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
  }

  filterByStage(stage: string) {
    this.stageFilter = stage;
    this.dataSource.filterPredicate = (row: any, f: string) => !f || row.status === f;
    this.dataSource.filter = stage;
  }

  stageClass(s: string): string {
    const map: Record<string, string> = {
      NEW: 'badge-blue', CONTACTED: 'badge-cyan', TEST_DRIVE: 'badge-yellow',
      NEGOTIATION: 'badge-purple', BOOKED: 'badge-green', LOST: 'badge-red'
    };
    return map[s] ?? 'badge-grey';
  }

  confirmDelete(l: any) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Lead', message: `Delete lead ${l.leadNumber}?`, confirmText: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.deleteLead(l.id).subscribe({
        next: () => { this.snack.open('Lead deleted', 'Close', { duration: 3000 }); this.load(); },
        error: () => { this.snack.open('Delete failed', 'Close', { duration: 3000 }); }
      });
    });
  }
}
