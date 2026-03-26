import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-booking-detail',
  template: `
    <div class="page-container" *ngIf="booking">
      <div class="page-header mb-4">
        <div class="page-title">
          <button mat-icon-button (click)="router.navigate(['/sales'])" class="mr-2">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Booking {{booking.bookingNumber}}</h1>
          <p>Sales pipeline details & vehicle allocation</p>
        </div>
        <div class="header-actions">
          <span [class]="'badge ' + statusClass(booking.status)" style="font-size: 1rem; padding: 6px 12px">
            {{booking.status}}
          </span>
        </div>
      </div>

      <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        
        <!-- Customer Info -->
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-icon mat-card-avatar style="font-size: 32px; height:32px; width:32px; color: var(--hd-blue)">person</mat-icon>
            <mat-card-title>Customer Details</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-3">
            <div class="info-row">
              <span class="label">Name</span>
              <span class="value">{{booking.customer?.firstName}} {{booking.customer?.lastName}}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone</span>
              <span class="value">{{booking.customer?.phone}}</span>
            </div>
            <div class="info-row">
              <span class="label">Email</span>
              <span class="value">{{booking.customer?.email || '—'}}</span>
            </div>
            <div class="info-row">
              <span class="label">Code</span>
              <span class="value" style="font-family:monospace">{{booking.customer?.customerCode}}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Vehicle Info -->
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-icon mat-card-avatar style="font-size: 32px; height:32px; width:32px; color: var(--hd-blue)">directions_car</mat-icon>
            <mat-card-title>Vehicle Specifications</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-3">
            <div class="info-row">
              <span class="label">Model</span>
              <span class="value" style="font-weight:600">{{booking.variant?.model?.modelName}}</span>
            </div>
            <div class="info-row">
              <span class="label">Variant</span>
              <span class="value">{{booking.variant?.variantName}}</span>
            </div>
            <div class="info-row">
              <span class="label">Color</span>
              <span class="value" style="display:flex;align-items:center;gap:8px">
                <div [style.background]="booking.color?.hexCode" style="width:14px;height:14px;border-radius:50%;border:1px solid #ccc"></div>
                {{booking.color?.name}}
              </span>
            </div>
            <div class="info-row" *ngIf="booking.vehicle">
              <span class="label">Allocated VIN</span>
              <span class="value" style="font-family:monospace;color:var(--hd-blue)">{{booking.vehicle.vin}}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Pricing Info -->
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-icon mat-card-avatar style="font-size: 32px; height:32px; width:32px; color: var(--hd-blue)">payments</mat-icon>
            <mat-card-title>Pricing breakdown</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-3">
            <div class="info-row">
              <span class="label">Ex-Showroom</span>
              <span class="value">{{booking.exShowroom | currency:'INR':'symbol':'1.0-0'}}</span>
            </div>
            <div class="info-row">
              <span class="label text-red">Discount Applied</span>
              <span class="value text-red">-{{booking.discount | currency:'INR':'symbol':'1.0-0'}}</span>
            </div>
            <div class="info-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee">
              <span class="label" style="font-size: 1.1rem; font-weight: 700; color: #000">Total On-Road</span>
              <span class="value" style="font-size: 1.2rem; font-weight: 800; color: var(--hd-blue)">
                {{booking.totalOnRoad | currency:'INR':'symbol':'1.0-0'}}
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Sales Execution -->
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-icon mat-card-avatar style="font-size: 32px; height:32px; width:32px; color: var(--hd-blue)">support_agent</mat-icon>
            <mat-card-title>Operations</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-3">
            <div class="info-row">
              <span class="label">Sales Exec</span>
              <span class="value">{{booking.salesExec?.firstName}} {{booking.salesExec?.lastName}}</span>
            </div>
            <div class="info-row">
              <span class="label">Booking Date</span>
              <span class="value">{{booking.createdAt | date:'mediumDate'}}</span>
            </div>
            <div class="info-row">
              <span class="label">Expected Delivery</span>
              <span class="value">{{booking.expectedDelivery | date:'mediumDate' || 'TBD'}}</span>
            </div>
            <div class="info-row" *ngIf="booking.lead">
              <span class="label">Linked Lead</span>
              <span class="value" style="font-family:monospace">{{booking.lead.leadNumber}}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .detail-card { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-radius: 12px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .label { color: var(--text-secondary); font-size: 0.9rem; }
    .value { font-weight: 500; text-align: right; }
    .text-red { color: var(--hd-red); }
  `]
})
export class BookingDetailComponent implements OnInit {
  booking: any;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Mock /bookings/:id logic since there's no native getBookingById yet in ApiService
      // Using /bookings?size=1000 and matching client-side or we implement getBookingById
      this.api.getBookings({ page: 0, size: 500 }).subscribe({
        next: (res: any) => {
          this.booking = res.content.find((b:any) => b.id === +id);
          if(!this.booking) {
            this.snack.open('Booking not found', 'Close');
            this.router.navigate(['/sales']);
          }
        },
        error: () => this.snack.open('Failed to load booking details', 'Close')
      });
    }
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
}
