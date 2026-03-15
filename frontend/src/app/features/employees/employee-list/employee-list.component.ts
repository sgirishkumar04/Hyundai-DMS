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
  selector: 'app-employee-list',
  template: `
    <div>
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Employees</h1>
          <p>Manage dealership staff and roles</p>
        </div>
        <button mat-raised-button style="background:var(--hd-blue);color:#fff"
                (click)="router.navigate(['/employees/add'])">
          <mat-icon>person_add</mat-icon> Add Employee
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search employees…</mat-label>
            <mat-icon matPrefix style="color:var(--text-muted)">search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Name, email, code…">
          </mat-form-field>
          <mat-form-field appearance="outline" style="max-width:200px">
            <mat-label>Department</mat-label>
            <mat-select [(value)]="deptFilter" (selectionChange)="applyDeptFilter()">
              <mat-option value="">All Departments</mat-option>
              <mat-option *ngFor="let d of departments" [value]="d">{{d}}</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="flex-1"></div>
          <span class="text-sm text-secondary">{{dataSource.filteredData.length}} employees</span>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

        <table mat-table [dataSource]="dataSource" matSort class="data-table">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
            <td mat-cell *matCellDef="let e">
              <span style="font-family:monospace;font-size:.8rem;color:var(--hd-blue)">{{e.employeeCode}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
            <td mat-cell *matCellDef="let e">
              <div style="display:flex;align-items:center;gap:10px">
                <div [style.background]="avatarColor(e.firstName)"
                     style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff;flex-shrink:0">
                  {{(e.firstName?.[0] ?? '') + (e.lastName?.[0] ?? '')}}
                </div>
                <div>
                  <div style="font-weight:600">{{e.firstName}} {{e.lastName}}</div>
                  <div class="text-xs text-secondary">{{e.email}}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
            <td mat-cell *matCellDef="let e">{{e.department?.name ?? '—'}}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let e">
              <span [class]="'badge ' + roleClass(e.role?.name)">
                {{formatRole(e.role?.name)}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let e">{{e.phone}}</td>
          </ng-container>

          <ng-container matColumnDef="joined">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Joined</th>
            <td mat-cell *matCellDef="let e">{{e.dateOfJoin | date:'dd MMM yyyy'}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let e">
              <span [class]="'badge ' + (e.isActive ? 'badge-green' : 'badge-red')">
                {{e.isActive ? 'Active' : 'Inactive'}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let e">
              <div class="action-btns">
                <button mat-icon-button matTooltip="Edit" (click)="router.navigate(['/employees/edit', e.id])">
                  <mat-icon style="font-size:18px;color:var(--hd-blue)">edit</mat-icon>
                </button>
                <button mat-icon-button [matTooltip]="e.isActive ? 'Deactivate' : 'Activate'"
                        (click)="toggleActive(e)">
                  <mat-icon style="font-size:18px" [style.color]="e.isActive ? '#e6870a' : '#1b8a4a'">
                    {{e.isActive ? 'person_off' : 'how_to_reg'}}
                  </mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          <tr class="mat-mdc-no-data-row" *matNoDataRow>
            <td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">
              <mat-icon>badge</mat-icon><br>No employees found
            </td>
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `
})
export class EmployeeListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['code','name','department','role','phone','joined','status','actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  deptFilter = '';
  departments: string[] = [];
  private palette = ['#002c5f','#0e7490','#1b8a4a','#6a1b9a','#c2410c','#e6870a'];

  constructor(private api: ApiService, private dialog: MatDialog,
              private snack: MatSnackBar, public router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getEmployees({ page: 0, size: 200 }).subscribe({
      next: res => {
        const data = res.content ?? [];
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.departments = [...new Set(data.map((e: any) => e.department?.name).filter(Boolean))] as string[];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(e: Event) {
    this.dataSource.filter = (e.target as HTMLInputElement).value.trim().toLowerCase();
  }

  applyDeptFilter() {
    this.dataSource.filterPredicate = (row: any, f: string) => !f || row.department?.name === f;
    this.dataSource.filter = this.deptFilter;
  }

  avatarColor(name: string): string {
    return this.palette[(name?.charCodeAt(0) ?? 0) % this.palette.length];
  }

  roleClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'badge-red', SALES_MANAGER: 'badge-blue', SALES_EXECUTIVE: 'badge-cyan',
      SERVICE_ADVISOR: 'badge-orange', MECHANIC: 'badge-grey', INVENTORY_MANAGER: 'badge-purple', ACCOUNTS: 'badge-green'
    };
    const key = (role ?? '').replace('ROLE_', '');
    return map[key] ?? 'badge-grey';
  }

  formatRole(role: string): string {
    return (role ?? '').replace('ROLE_', '').split('_').map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  toggleActive(e: any) {
    const action = e.isActive ? 'Deactivate' : 'Activate';
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${action} Employee`,
        message: `${action} ${e.firstName} ${e.lastName}?`,
        confirmText: action, danger: e.isActive
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.updateEmployee(e.id, { ...e, isActive: !e.isActive }).subscribe({
        next: () => { this.snack.open(`Employee ${action.toLowerCase()}d`, 'Close', { duration: 3000 }); this.load(); },
        error: () => { this.snack.open('Update failed', 'Close', { duration: 3000 }); }
      });
    });
  }
}
