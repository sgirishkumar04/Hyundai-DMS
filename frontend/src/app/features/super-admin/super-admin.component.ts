import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface Registration {
  id: number; dealerName: string; city: string; state: string;
  contactName: string; contactPhone: string; adminEmail: string;
  adminFullName: string; gstNumber: string; address: string;
  status: 'PENDING' | 'ACTIVE' | 'DECLINED';
  createdAt: string; rejectionReason?: string;
  dealer?: { id: number; dealerCode: string; };
}

interface Dealer {
  id: number; dealerCode: string; name: string; city: string;
  state: string; status: string; contactName: string;
  contactEmail: string; contactPhone: string; gstNumber: string; createdAt: string;
}

@Component({
  selector: 'app-super-admin',
  styles: [`
    .sa-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #002c5f; margin: 0; }
    
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,.05);
      border: 1px solid #eef2f6; display: flex; align-items: center; gap: 20px; }
    .stat-card .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .stat-card .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-card .stat-val { font-size: 2.2rem; font-weight: 800; color: #1a2537; line-height: 1; }
    .stat-card .stat-lbl { font-size: .75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-top: 4px; }
    
    .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.05); border: 1px solid #eef2f6; overflow: hidden; }
    .card-hdr { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .card-hdr h3 { font-size: 1rem; font-weight: 700; color: #002c5f; display: flex; align-items: center; gap: 10px; margin: 0; }
    
    .reg-table { width: 100%; border-collapse: collapse; }
    .reg-table th { background: #f8fafc; color: #475569; font-size: .75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .05em; padding: 14px 20px; text-align: left; border-bottom: 2px solid #f1f5f9; }
    .reg-table td { padding: 16px 20px; font-size: .85rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; }
    .reg-table tr:hover td { background: #fcfdfe; }
    
    .badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: .7rem; font-weight: 700; text-transform: uppercase; }
    .badge-pending  { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .badge-approved { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .badge-declined { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    
    .action-btns { display: flex; gap: 8px; }
    .reject-area { padding: 20px; background: #fff5f5; border-top: 1px solid #fee2e2; }
    .empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
    .empty mat-icon { font-size: 64px; width: 64px; height: 64px; opacity: .2; display: block; margin: 0 auto 16px; }

    ::ng-deep .mat-mdc-tab-group { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.05); border: 1px solid #eef2f6; }
    ::ng-deep .mat-mdc-tab-labels { padding: 0 12px; border-bottom: 1px solid #f1f5f9; }
  `],
  template: `
  <div class="sa-container">
    <div class="page-header">
      <div>
        <h1>Dealer Management</h1>
        <p style="color:#64748b; margin:4px 0 0; font-size:.9rem">Oversee and approve dealership network applications</p>
      </div>
      <button mat-raised-button color="primary" (click)="loadAll()" style="background:#002c5f">
        <mat-icon>refresh</mat-icon> Refresh Data
      </button>
    </div>

    <!-- Stats -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#e0f2fe"><mat-icon style="color:#0369a1">storefront</mat-icon></div>
        <div>
          <div class="stat-val">{{dealers.length}}</div>
          <div class="stat-lbl">Active Dealers</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fff7ed"><mat-icon style="color:#c2410c">hourglass_empty</mat-icon></div>
        <div>
          <div class="stat-val">{{pending.length}}</div>
          <div class="stat-lbl">Pending Review</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#f0fdf4"><mat-icon style="color:#15803d">assignment_turned_in</mat-icon></div>
        <div>
          <div class="stat-val">{{allRegs.length}}</div>
          <div class="stat-lbl">Total Applications</div>
        </div>
      </div>
    </div>

    <!-- Main Tabs -->
    <mat-tab-group animationDuration="200ms">
      
      <!-- Pending Tab -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon style="margin-right:8px">pending_actions</mat-icon>
          Pending Approvals
          <span *ngIf="pending.length" style="margin-left:8px; background:#ef4444; color:#fff; font-size:.7rem; padding:2px 8px; border-radius:10px">{{pending.length}}</span>
        </ng-template>
        
        <div style="padding:24px">
          <div *ngIf="pending.length === 0" class="empty">
            <mat-icon>check_circle</mat-icon>
            <p>All clear! No pending applications to review.</p>
          </div>
          <div style="overflow-x:auto" *ngIf="pending.length > 0">
            <ng-container *ngTemplateOutlet="regTable; context:{rows: pending}"></ng-container>
          </div>
        </div>
      </mat-tab>

      <!-- Active Dealers Tab -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon style="margin-right:8px">storefront</mat-icon>
          Authorized Dealerships
        </ng-template>
        
        <div style="padding:24px">
          <div *ngIf="dealers.length === 0" class="empty">
            <mat-icon>storefront</mat-icon>
            <p>No dealerships have been authorized yet.</p>
          </div>
          <div style="overflow-x:auto" *ngIf="dealers.length > 0">
            <table class="reg-table">
              <thead><tr>
                <th>Code</th><th>Dealership Name</th><th>Location</th>
                <th>GSTIN</th><th>Primary Contact</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                <tr *ngFor="let d of dealers">
                  <td><code style="background:#f1f5f9;padding:4px 8px;border-radius:6px;font-size:.75rem;font-weight:700;color:#002c5f">{{d.dealerCode}}</code></td>
                  <td style="font-weight:700; color:#002c5f">{{d.name}}</td>
                  <td>{{d.city}}, {{d.state}}</td>
                  <td style="font-family:monospace">{{d.gstNumber || '—'}}</td>
                  <td>{{d.contactName}}</td>
                  <td>
                    <span class="badge" [class.badge-approved]="d.status==='ACTIVE'" [class.badge-declined]="d.status==='DEACTIVATED'">
                      {{d.status}}
                    </span>
                  </td>
                  <td>
                    <button mat-icon-button [matTooltip]="d.status === 'ACTIVE' ? 'Deactivate Dealership' : 'Activate Dealership'"
                            (click)="toggleDealerStatus(d)">
                      <mat-icon [style.color]="d.status === 'ACTIVE' ? '#dc2626' : '#166534'">
                        {{d.status === 'ACTIVE' ? 'block' : 'check_circle'}}
                      </mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </mat-tab>

      <!-- All History Tab -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon style="margin-right:8px">history</mat-icon>
          Application History
        </ng-template>
        
        <div style="padding:24px">
          <div style="overflow-x:auto">
            <ng-container *ngTemplateOutlet="regTable; context:{rows: allRegs}"></ng-container>
          </div>
        </div>
      </mat-tab>

    </mat-tab-group>
  </div>

  <!-- Shared Table Template -->
  <ng-template #regTable let-rows="rows">
    <table class="reg-table">
      <thead><tr>
        <th>ID</th><th>Dealership / Admin</th><th>Location</th><th>Contact Info</th>
        <th>Applied On</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let r of rows">
          <td style="color:#94a3b8; font-weight:700">#{{r.id}}</td>
          <td>
            <div style="font-weight:700; color:#002c5f">{{r.dealerName}}</div>
            <div style="font-size:.75rem; color:#64748b; margin-top:2px">{{r.adminFullName}}</div>
          </td>
          <td>{{r.city}}, {{r.state}}</td>
          <td>
            <div style="font-weight:500">{{r.contactPhone}}</div>
            <div style="font-size:.75rem; color:#0369a1">{{r.adminEmail}}</div>
          </td>
          <td style="color:#64748b; font-size:.8rem">{{r.createdAt | date:'dd MMM yyyy HH:mm'}}</td>
          <td>
            <span class="badge"
              [class.badge-pending]="r.status==='PENDING'"
              [class.badge-approved]="r.status==='ACTIVE'"
              [class.badge-declined]="r.status==='DECLINED'">
              {{r.status === 'ACTIVE' ? 'APPROVED' : r.status}}
            </span>
          </td>
          <td style="min-width:180px">
            <div class="action-btns" *ngIf="r.status === 'PENDING'">
              <button mat-flat-button color="primary" style="background:#166534; font-size:.75rem; height:32px; line-height:32px" (click)="approve(r)" [disabled]="loadingId === r.id">
                <mat-icon style="font-size:16px;width:16px;height:16px">check</mat-icon> Approve
              </button>
              <button mat-stroked-button color="warn" style="font-size:.75rem; height:32px; line-height:32px" (click)="toggleDecline(r)">
                <mat-icon style="font-size:16px;width:16px;height:16px">close</mat-icon> Decline
              </button>
            </div>
            <div *ngIf="r.status === 'ACTIVE'" style="color:#166534; font-size:.8rem; font-weight:700; display:flex; align-items:center; gap:6px">
              <mat-icon style="font-size:18px; width:18px; height:18px">verified</mat-icon>
              {{r.dealer?.dealerCode}}
            </div>
            <div *ngIf="r.status === 'DECLINED'" style="color:#991b1b; font-size:.8rem; font-weight:600">
              Declined
            </div>
          </td>
        </tr>
        <!-- Rejection row -->
        <tr *ngFor="let r of rows" [style.display]="declineId === r.id ? 'table-row' : 'none'">
          <td colspan="7" class="reject-area">
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div style="font-size:.85rem; font-weight:700; color:#991b1b">Provide a reason for declining {{r.dealerName}}</div>
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Rejection Reason</mat-label>
                <textarea matInput [(ngModel)]="declineReason" rows="2" placeholder="e.g. Incomplete documentation, zone already covered..."></textarea>
              </mat-form-field>
              <div style="display:flex; gap:12px">
                <button mat-raised-button color="warn" (click)="decline(r)" [disabled]="loadingId === r.id">Confirm Decline</button>
                <button mat-button (click)="declineId = null">Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </ng-template>
  `
})
export class SuperAdminComponent implements OnInit {
  pending: Registration[]    = [];
  allRegs: Registration[]    = [];
  dealers: Dealer[]           = [];
  loadingId: number | null    = null;
  declineId: number | null    = null;
  declineReason               = '';

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    public auth: AuthService
  ) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.http.get<Registration[]>(`${environment.apiUrl}/dealers/registrations`).subscribe({
      next: (r) => {
        this.allRegs = r;
        this.pending = r.filter(x => x.status === 'PENDING');
      },
      error: () => {}
    });
    this.http.get<Dealer[]>(`${environment.apiUrl}/dealers`).subscribe({
      next: (d) => this.dealers = d, // Show all dealers now
      error: () => {}
    });
  }

  toggleDealerStatus(dealer: Dealer) {
    const isActivating = dealer.status !== 'ACTIVE';
    const action = isActivating ? 'Activate' : 'Deactivate';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action} Dealership`,
        message: `Are you sure you want to ${action.toLowerCase()} ${dealer.name}? This will affect all associated employees.`,
        confirmText: isActivating ? 'Activate' : 'Deactivate Dealership',
        danger: !isActivating
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/dealers/${dealer.id}/toggle-status`, {}).subscribe({
          next: () => {
            this.snack.open(`Dealership ${dealer.name} ${action.toLowerCase()}d successfully.`, 'OK', { duration: 3000 });
            this.loadAll();
          },
          error: (e) => {
            this.snack.open(e.error?.message || 'Update failed', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  approve(reg: Registration) {
    this.loadingId = reg.id;
    this.http.post(`${environment.apiUrl}/dealers/registrations/${reg.id}/approve`, {}).subscribe({
      next: () => {
        this.loadingId = null;
        this.snack.open(`✅ ${reg.dealerName} approved successfully!`, 'OK', { duration: 4000 });
        this.loadAll();
      },
      error: (e) => {
        this.loadingId = null;
        this.snack.open(e.error?.message || 'Approval failed', 'OK', { duration: 3000 });
      }
    });
  }

  toggleDecline(reg: Registration) {
    this.declineId    = this.declineId === reg.id ? null : reg.id;
    this.declineReason = '';
  }

  decline(reg: Registration) {
    this.loadingId = reg.id;
    this.http.post(`${environment.apiUrl}/dealers/registrations/${reg.id}/decline`,
      { reason: this.declineReason }).subscribe({
      next: () => {
        this.loadingId = null; this.declineId = null;
        this.snack.open(`Declined application for ${reg.dealerName}.`, 'OK', { duration: 3000 });
        this.loadAll();
      },
      error: () => { this.loadingId = null; }
    });
  }
}
