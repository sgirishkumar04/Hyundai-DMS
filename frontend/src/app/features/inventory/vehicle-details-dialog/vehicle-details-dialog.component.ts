import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div>
          <h2 mat-dialog-title>{{data.modelName}} <span class="text-secondary" style="font-weight:400">{{data.variantName}}</span></h2>
          <div class="vin-tag">{{data.vin}}</div>
        </div>
        <button mat-icon-button (click)="close()" style="margin-top:-8px">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div mat-dialog-content class="details-content mt-4">
        <div *ngIf="loading" class="flex flex-col items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
          <p class="mt-4 text-secondary">Fetching unit history...</p>
        </div>

        <div *ngIf="!loading && details">
          <div class="grid grid-cols-2 gap-8">
            <!-- Left: Specifications -->
            <section>
              <h3 class="section-title"><mat-icon>settings_suggest</mat-icon> Technical Specifications</h3>
              <div class="info-grid mt-3">
                <div class="info-item">
                  <label>Engine Number</label>
                  <span>{{details.engineNumber || '—'}}</span>
                </div>
                <div class="info-item">
                  <label>Chassis Number</label>
                  <span>{{details.chassisNumber || '—'}}</span>
                </div>
                <div class="info-item">
                  <label>Color</label>
                  <div class="flex items-center gap-2">
                    <div [style.background]="details.hexCode" class="color-swatch"></div>
                    <span>{{details.colorName}}</span>
                  </div>
                </div>
                <div class="info-item">
                  <label>Manufacturing Date</label>
                  <span>{{details.mfgDate ? (details.mfgDate | date:'mediumDate') : details.mfgYear}}</span>
                </div>
                <div class="info-item">
                  <label>Arrival Date</label>
                  <span>{{details.arrivalDate | date:'mediumDate' || '—'}}</span>
                </div>
                <div class="info-item">
                  <label>Location</label>
                  <span>{{details.locationName}}</span>
                </div>
                <div class="info-item">
                  <label>Status</label>
                  <span [class]="'badge ' + statusClass(details.status)">{{details.status | titlecase}}</span>
                </div>
              </div>

              <h3 class="section-title mt-6"><mat-icon>payments</mat-icon> Commercial Details</h3>
              <div class="info-grid mt-3">
                <div class="info-item">
                  <label>Purchase Cost</label>
                  <span class="font-semibold">{{details.dealerCost | currency:'INR':'symbol':'1.0-0'}}</span>
                </div>
                <div class="info-item">
                  <label>Ex-Showroom Price</label>
                  <span class="font-semibold text-primary">{{details.exShowroomPrice | currency:'INR':'symbol':'1.0-0'}}</span>
                </div>
              </div>
            </section>

            <!-- Right: Sales Info -->
            <section>
              <h3 class="section-title"><mat-icon>assignment_turned_in</mat-icon> Sales Information</h3>
              
              <div *ngIf="details.salesInfo" class="sales-card mt-3">
                <div class="info-grid p-4">
                  <div class="info-item">
                    <label>Booking ID</label>
                    <span class="booking-num">{{details.salesInfo.bookingNumber}}</span>
                  </div>
                  <div class="info-item">
                    <label>Status</label>
                    <span class="text-xs font-semibold uppercase tracking-wider" [style.color]="'var(--hd-blue)'">
                      {{details.salesInfo.bookingStatus}}
                    </span>
                  </div>
                  <div class="info-item col-span-2">
                    <label>Customer Name</label>
                    <div class="font-semibold text-lg">{{details.salesInfo.customerName}}</div>
                    <div class="text-xs text-secondary">{{details.salesInfo.customerEmail}} • {{details.salesInfo.customerPhone}}</div>
                  </div>
                  <div class="info-item col-span-2 mt-2">
                    <label>Sales Executive</label>
                    <div class="flex items-center gap-2">
                      <mat-icon style="font-size:16px; width:16px; height:16px; color:var(--hd-blue)">person_outline</mat-icon>
                      <span>{{details.salesInfo.salesExecutiveName}}</span>
                    </div>
                  </div>
                  <div class="info-item mt-2">
                    <label>Invoice Number</label>
                    <span>{{details.salesInfo.invoiceNumber || 'Not Generated'}}</span>
                  </div>
                  <div class="info-item mt-2">
                    <label>Delivery Date</label>
                    <span>{{details.salesInfo.deliveryDate | date:'mediumDate' || 'TBD'}}</span>
                  </div>
                </div>
              </div>

              <div *ngIf="!details.salesInfo" class="empty-sales mt-3">
                <mat-icon style="font-size:48px; width:48px; height:48px">inventory_2</mat-icon>
                <p>This unit is available in stock</p>
                <span class="text-xs text-secondary text-center px-8">No booking or sales records found for this VIN.</span>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div mat-dialog-actions align="end" class="pb-4">
        <button mat-button (click)="close()">Close</button>
        <button mat-raised-button color="primary" [disabled]="loading" (click)="router.navigate(['/inventory', details.id, 'edit'])">
          Edit Vehicle
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 8px; }
    .dialog-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; }
    .vin-tag { 
      font-family: monospace; 
      background: #f0f4f8; 
      color: var(--hd-blue); 
      padding: 2px 8px; 
      border-radius: 4px; 
      display: inline-block; 
      margin-top: 4px;
      font-size: 0.85rem;
      border: 1px solid #d0e0f0;
    }
    .section-title { 
      font-size: 0.9rem; 
      font-weight: 600; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      color: #555;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--hd-blue); }
    
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .info-item label { display: block; font-size: 0.75rem; color: #888; margin-bottom: 2px; }
    .info-item span { font-size: 0.95rem; color: #333; }
    
    .color-swatch { width: 12px; height: 12px; border-radius: 50%; border: 1px solid #ccc; flex-shrink: 0; }
    
    .sales-card { 
      background: #f8fbff; 
      border: 1px solid #e1e9f5; 
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }
    .sales-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: var(--hd-blue);
    }
    .booking-num { font-weight: 700; color: var(--hd-blue); }
    
    .empty-sales {
      height: 240px;
      border: 2px dashed #eee;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
    }
    
    .badge { padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge-green { background: #e6f4ea; color: #1e7e34; }
    .badge-blue { background: #e8f0fe; color: #1967d2; }
    .badge-grey { background: #f1f3f4; color: #5f6368; }
    .badge-cyan { background: #e4f7fb; color: #00838f; }
    .badge-yellow { background: #fef7e0; color: #f29900; }
    .badge-purple { background: #f3e8fd; color: #8e24aa; }
  `]
})
export class VehicleDetailsDialogComponent implements OnInit {
  loading = true;
  details: any = null;

  constructor(
    public dialogRef: MatDialogRef<VehicleDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadDetails();
  }

  loadDetails() {
    this.api.getVehicleDetails(this.data.id).subscribe({
      next: res => {
        this.details = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // fallback in case detail call fails
        this.details = this.data; 
      }
    });
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      IN_STOCK: 'badge-green', BOOKED: 'badge-blue', SOLD: 'badge-grey',
      DEMO: 'badge-cyan', IN_TRANSIT: 'badge-yellow', ALLOCATED: 'badge-purple'
    };
    return map[s] ?? 'badge-grey';
  }

  close() {
    this.dialogRef.close();
  }
}
