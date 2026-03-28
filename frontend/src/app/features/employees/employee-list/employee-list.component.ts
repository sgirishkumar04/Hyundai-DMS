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
  selector: 'app-employee-list',
  template: `
    <style>
      .inactive-row { background-color: rgba(0,0,0,0.02); opacity: 0.75; }
    </style>
    <div>
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Employees</h1>
          <p>Manage dealership staff and roles</p>
        </div>
        <button mat-raised-button style="background:var(--hd-blue);color:#fff"
                *ngIf="canCreate"
                (click)="router.navigate(['/employees/add'])">
          <mat-icon>person_add</mat-icon> Add Employee
        </button>
      </div>

      <div class="table-container">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search employees…</mat-label>
            <mat-icon matPrefix style="color:var(--text-muted)">search</mat-icon>
            <input matInput #searchInput (keyup)="applyFilter($event)" placeholder="Name, email, code…">
          </mat-form-field>
          <button mat-icon-button (click)="resetFilters()" matTooltip="Reset Filters" style="margin-right: 8px; color: var(--text-muted)">
            <mat-icon>refresh</mat-icon>
          </button>
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
              <div style="display:flex; flex-direction:column; gap:4px">
                <span [class]="'badge ' + (e.isActive ? 'badge-green' : 'badge-red')">
                  {{e.isActive ? 'Active' : 'Inactive'}}
                </span>
                <span *ngIf="e.isLocked" class="badge badge-orange" style="font-size:10px; padding:2px 6px">
                  <mat-icon style="font-size:12px; width:12px; height:12px; vertical-align:middle">lock</mat-icon> Locked
                </span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let e">
              <div class="action-btns">
                <button *ngIf="canEdit" mat-icon-button matTooltip="Edit" (click)="router.navigate(['/employees/edit', e.id])">
                  <mat-icon style="font-size:18px;color:var(--hd-blue)">edit</mat-icon>
                </button>
                <button *ngIf="canEdit && e.isLocked" mat-icon-button matTooltip="Unlock Account" (click)="unlockAccount(e)">
                  <mat-icon style="font-size:18px;color:#e6870a">lock_open</mat-icon>
                </button>
                <button *ngIf="canEdit && canDeactivate(e)" mat-icon-button [matTooltip]="e.isActive ? 'Deactivate' : 'Activate'"
                        (click)="toggleActive(e)">
                  <mat-icon style="font-size:18px" [style.color]="e.isActive ? '#64748b' : '#1b8a4a'">
                    {{e.isActive ? 'person_off' : 'person_add'}}
                  </mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" [class.inactive-row]="!row.isActive"></tr>
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
  @ViewChild('searchInput') searchInput!: any;

  unlockAccount(e: any) {
    this.api.unlockEmployee(e.id).subscribe({
      next: () => {
        this.snack.open('Account unlocked successfully', 'Close', { duration: 3000 });
        this.load();
      },
      error: (err) => {
        this.snack.open(err.error?.message || 'Unlock failed', 'Close', { duration: 3000 });
      }
    });
  }

  columns = ['code','name','department','role','phone','joined','status','actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  searchText = '';
  deptFilter = '';
  departments: string[] = [];
  private palette = ['#002c5f','#0e7490','#1b8a4a','#6a1b9a','#c2410c','#e6870a'];

  resetFilters() {
    this.searchText = '';
    this.deptFilter = '';
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    this.updateFilter();
  }

  constructor(private api: ApiService, private dialog: MatDialog,
              private snack: MatSnackBar, public router: Router,
              private auth: AuthService) {}

  get canCreate(): boolean { return this.auth.hasPermission('EMPLOYEES_CREATE'); }
  get canEdit(): boolean { return this.auth.hasPermission('EMPLOYEES_EDIT'); }
  get canDelete(): boolean { return this.auth.hasPermission('EMPLOYEES_DELETE'); }
  get isSuperAdmin(): boolean { return this.auth.currentUser?.isSuperAdmin ?? false; }

  canDeactivate(e: any): boolean {
    if (this.isSuperAdmin) return true;
    const role = (e.role?.name ?? '').replace('ROLE_', '');
    // Branch Admin cannot deactivate other Admins or Super Admins
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return false;
    return this.canEdit || this.canDelete;
  }

  ngOnInit() {
    this.dataSource.filterPredicate = (row: any, filterValue: string) => {
      let f: any;
      try { f = JSON.parse(filterValue); } catch(e) { return true; }
      
      const text = f.text?.toLowerCase() || '';
      const matchSearch = !text || [
        row.employeeCode,
        row.firstName,
        row.lastName,
        row.email,
        row.phone
      ].join(' ').toLowerCase().includes(text);
      
      const matchDept = !f.dept || row.department?.name === f.dept;
      return matchSearch && matchDept;
    };
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getEmployees({ page: 0, size: 200 }).subscribe({
      next: res => {
        const data = (res.content ?? []).sort((a: any, b: any) => {
          // Sort ADMINS to top
          const aAdm = a.role?.name === 'ROLE_ADMIN';
          const bAdm = b.role?.name === 'ROLE_ADMIN';
          if (aAdm && !bAdm) return -1;
          if (!aAdm && bAdm) return 1;
          return a.firstName.localeCompare(b.firstName);
        });
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
    this.searchText = (e.target as HTMLInputElement).value;
    this.updateFilter();
  }

  applyDeptFilter() {
    this.updateFilter();
  }

  updateFilter() {
    this.dataSource.filter = JSON.stringify({
      text: this.searchText,
      dept: this.deptFilter
    });
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
      this.api.deleteEmployee(e.id).subscribe({
        next: () => { 
          this.snack.open(`Account ${action.toLowerCase()}d successfully`, 'Close', { duration: 3000 }); 
          this.load(); 
        },
        error: (err) => { 
          console.error('Deactivation error:', err);
          this.snack.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 }); 
        }
      });
    });
  }
}
