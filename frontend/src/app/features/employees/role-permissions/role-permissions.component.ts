import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-permissions',
  template: `
    <div class="page-container">
      <div class="page-header mb-4">
        <div class="page-title">
          <h1>Role Permissions</h1>
          <p>Configure dynamic access controls for organizational roles</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Left Pane: Roles List -->
        <mat-card class="role-list-card">
          <mat-card-header>
          <mat-card-title>System Roles</mat-card-title>
        </mat-card-header>
        <mat-card-content>
            <mat-nav-list>
              <a mat-list-item *ngFor="let r of roles"
                 [class.selected]="selectedRole?.id === r.id"
                 (click)="selectRole(r)">
                <span matListItemTitle>{{(r.name || '').replace('ROLE_', '')}}</span>
                <span matListItemLine class="text-xs text-secondary">{{r.description || 'No description available'}}</span>
              </a>
            </mat-nav-list>
          </mat-card-content>
        </mat-card>

        <!-- Right Pane: Permissions Checklist -->
        <mat-card class="permissions-card" *ngIf="selectedRole">
          <mat-card-header class="header-with-action">
            <mat-card-title>Permissions targeting: <span style="color:var(--hd-blue)">{{selectedRole.name.replace('ROLE_', '')}}</span></mat-card-title>
            <button mat-raised-button color="primary" (click)="savePermissions()" [disabled]="saving">
              <mat-icon>save</mat-icon> {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </mat-card-header>
          
          <mat-card-content>
            <div class="modules-grid">
              <!-- Group permissions by Prefix (e.g. SALES, INVENTORY) -->
              <div class="module-block" *ngFor="let group of groupedPermissions | keyvalue">
                <h3 class="module-title">{{group.key}} Module</h3>
                <div class="checkbox-grid">
                  <mat-checkbox *ngFor="let p of group.value; trackBy: trackByPermission"
                                [checked]="hasPermission(p.id)"
                                (change)="togglePermission(p.id)">
                    <div style="font-weight:500">{{formatPermName(p.name)}}</div>
                    <div class="text-xs text-secondary">{{p.description}}</div>
                  </mat-checkbox>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="permissions-card empty-state" *ngIf="!selectedRole">
          <mat-icon style="font-size:48px;width:48px;height:48px;color:var(--text-muted);margin-bottom:16px">security</mat-icon>
          <h2>Select a Role</h2>
          <p class="text-secondary">Choose a role from the left pane to view and modify its access permissions.</p>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { margin-bottom: 30px; }
    .content-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
    .role-list-card { height: calc(100vh - 200px); overflow-y: auto; }
    .permissions-card { min-height: calc(100vh - 200px); display:flex; flex-direction:column; }
    .empty-state { align-items:center; justify-content:center; text-align:center; padding: 48px; }
    
    .mat-mdc-list-item.selected { background: rgba(0, 44, 95, 0.08); border-right: 3px solid var(--hd-blue); }
    
    .header-with-action { display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ebebfc; }
    
    .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .module-block { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .module-title { font-size: 1rem; color: var(--hd-blue); margin-top: 0; margin-bottom: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .checkbox-grid { display: flex; flex-direction: column; gap: 12px; }
  `]
})
export class RolePermissionsComponent implements OnInit {
  roles: any[] = [];
  allPermissions: any[] = [];
  groupedPermissions: Record<string, any[]> = {};
  
  selectedRole: any = null;
  activePermissionIds: Set<number> = new Set();
  saving = false;

  constructor(private api: ApiService, private snack: MatSnackBar, public auth: AuthService) {}

  ngOnInit() {
    this.api.getRoles().subscribe({
      next: (res) => {
        console.log('Role Permissions Received:', res);
        this.roles = (res || []).filter(r => 
          r.name !== 'ROLE_SUPER_ADMIN' && 
          r.name !== 'ROLE_ADMIN' &&
          r.name !== 'SUPER_ADMIN' &&
          r.name !== 'ADMIN'
        );
      },
      error: (err) => console.error('Failed to fetch roles:', err)
    });

    this.api.getPermissions().subscribe({
      next: (res) => {
        this.allPermissions = res || [];
        this.groupPermissions();
      },
      error: (err) => console.error('Failed to fetch permissions:', err)
    });
  }

  groupPermissions() {
    this.groupedPermissions = {};
    for (const p of this.allPermissions) {
      const prefix = p.name.split('_')[0];
      if (!this.groupedPermissions[prefix]) {
        this.groupedPermissions[prefix] = [];
      }
      this.groupedPermissions[prefix].push(p);
    }
  }

  selectRole(role: any) {
    this.selectedRole = role;
    this.rebuildActivePermissionSet(role);
  }

  private rebuildActivePermissionSet(role: any) {
    const newSet = new Set<number>();
    if (role && role.permissions) {
      role.permissions.forEach((p: any) => newSet.add(Number(p.id)));
    }
    this.activePermissionIds = newSet;
  }

  hasPermission(permId: number): boolean {
    return this.activePermissionIds.has(Number(permId));
  }

  togglePermission(permissionId: any) {
    const id = Number(permissionId);
    const newSet = new Set(this.activePermissionIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.activePermissionIds = newSet;
  }

  trackByPermission(index: number, item: any): number {
    return Number(item.id);
  }

  formatPermName(name: string): string {
    const parts = name.split('_');
    if (parts.length > 1) return parts.slice(1).join(' ');
    return name;
  }

  savePermissions() {
    if (!this.selectedRole) return;
    this.saving = true;
    
    const permArray = Array.from(this.activePermissionIds);
    this.api.updateRolePermissions(this.selectedRole.id, permArray).subscribe({
      next: (updatedRole) => {
        this.saving = false;
        this.snack.open('Permissions saved successfully!', 'Close', { duration: 3000 });
        // Update local object to reflect save gracefully
        const idx = this.roles.findIndex(r => r.id === updatedRole.id);
        if(idx !== -1) {
          this.roles[idx] = updatedRole;
          this.selectRole(updatedRole);
        }

        // If the admin modified their own role's permissions, refresh their session dynamically.
        if (this.auth.role === updatedRole.name || this.auth.role === updatedRole.name.replace('ROLE_', '')) {
           this.auth.refreshProfile();
           setTimeout(() => window.location.reload(), 1500);
        }
      },
      error: () => {
        this.saving = false;
        this.snack.open('Failed to save permissions. Please check console.', 'Close', { duration: 3000 });
      }
    });
  }
}
