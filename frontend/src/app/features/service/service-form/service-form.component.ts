import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-service-form',
  template: `
    <div class="page-header px-4 mt-4">
      <h1>{{isEdit ? 'Edit' : 'New'}} Service Appointment</h1>
    </div>

    <div class="px-4">
      <mat-card style="max-width:900px" class="hd-card shadow-sm">
        <mat-card-content style="padding:24px">
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-row">
              <!-- Customer Autocomplete -->
              <mat-form-field appearance="outline">
                <mat-label>Search Customer (Name or Phone)</mat-label>
                <input type="text" matInput formControlName="customerSearch" [matAutocomplete]="auto">
                <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayCustomer" (optionSelected)="onCustomerSelected($event)">
                  <mat-option *ngFor="let c of filteredCustomers$ | async" [value]="c">
                    <div style="display:flex; flex-direction:column; line-height:1.2; padding:4px 0">
                      <span style="font-weight:600">{{c.firstName}} {{c.lastName}}</span>
                      <span style="font-size:12px; color:#666">{{c.phone}} | {{c.customerCode}}</span>
                    </div>
                  </mat-option>
                </mat-autocomplete>
                <mat-icon matSuffix *ngIf="form.get('customerSearch')?.value" style="cursor:pointer" (click)="clearCustomer()">close</mat-icon>
                <mat-hint *ngIf="!form.get('customerId')?.value" style="color:#ef4444">Please search and click a customer from the list</mat-hint>
                <mat-error *ngIf="form.get('customerId')?.hasError('required')">Selection is required</mat-error>
              </mat-form-field>

              <!-- Vehicle Reg No -->
              <mat-form-field appearance="outline">
                <mat-label>Vehicle Registration Number</mat-label>
                <input matInput formControlName="vehicleRegNo" placeholder="e.g. KA-01-AB-1234">
                <mat-error *ngIf="form.get('vehicleRegNo')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <!-- Appointment Date -->
              <mat-form-field appearance="outline">
                <mat-label>Appointment Date & Time</mat-label>
                <input matInput type="datetime-local" formControlName="appointmentDate">
                <mat-error *ngIf="form.get('appointmentDate')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <!-- Service Type -->
              <mat-form-field appearance="outline">
                <mat-label>Service Type</mat-label>
                <mat-select formControlName="serviceType">
                  <mat-option value="PERIODIC">Periodic Maintenance</mat-option>
                  <mat-option value="REPAIR">General Repair</mat-option>
                  <mat-option value="WARRANTY">Warranty Claim</mat-option>
                  <mat-option value="ACCIDENTAL">Accidental Repair</mat-option>
                  <mat-option value="RECALL">Product Recall</mat-option>
                  <mat-option value="GENERAL_CHECKUP">General Checkup</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row" *ngIf="isEdit">
              <!-- Status (if edit) -->
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="SCHEDULED">Scheduled</mat-option>
                  <mat-option value="IN_PROGRESS">In Progress</mat-option>
                  <mat-option value="COMPLETED">Completed</mat-option>
                  <mat-option value="CANCELLED">Cancelled</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Remarks / Instructions</mat-label>
              <textarea matInput formControlName="remarks" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions" style="margin-top:24px; display:flex; justify-content:flex-end; gap:16px">
              <button mat-stroked-button type="button" (click)="router.navigate(['/service'])" style="border-radius:8px">Cancel</button>
              <button mat-raised-button type="submit" 
                      [disabled]="form.invalid || loading"
                      style="background:var(--hd-blue); color:#fff; padding:0 32px">
                <mat-icon *ngIf="!loading">calendar_today</mat-icon>
                {{loading ? 'Please wait...' : (isEdit ? 'Update' : 'Schedule') + ' Appointment'}}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 8px; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class ServiceFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  appointmentNo?: string;
  loading = false;
  customers: any[] = [];
  filteredCustomers$?: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      customerSearch: [''],
      customerId: [null, Validators.required],
      vehicleRegNo: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      serviceType: ['PERIODIC', Validators.required],
      status: ['SCHEDULED'],
      remarks: [''],
      appointedBy: [null]
    });
  }

  ngOnInit() {
    this.setupAutocomplete();
    this.loadCustomers();
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEdit = true;
      this.loadAppointment();
    }
  }

  setupAutocomplete() {
    this.filteredCustomers$ = this.form.get('customerSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : ''),
      map(name => name ? this.filterCustomers(name) : this.customers.slice())
    );
  }

  filterCustomers(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(c => 
      (c.firstName + ' ' + c.lastName).toLowerCase().includes(filterValue) ||
      c.phone.includes(filterValue) ||
      c.customerCode.toLowerCase().includes(filterValue)
    );
  }

  displayCustomer(c: any): string {
    return c ? `${c.firstName} ${c.lastName}` : '';
  }

  onCustomerSelected(event: any) {
    const customer = event.option.value;
    this.form.patchValue({ customerId: customer.id });
  }

  clearCustomer() {
    this.form.patchValue({ customerSearch: '', customerId: null });
  }

  loadCustomers() {
    this.api.getCustomers({ size: 100 }).subscribe(res => {
      this.customers = res.content || [];
    });
  }

  loadAppointment() {
    this.loading = true;
    this.api.getAppointment(this.id!).subscribe({
      next: res => {
        this.appointmentNo = res.appointmentNo;
        this.form.patchValue({
          customerSearch: res.customer,
          customerId: res.customer?.id,
          vehicleRegNo: res.vehicleRegNo,
          appointmentDate: res.appointmentDate ? res.appointmentDate.substring(0, 16) : '',
          serviceType: res.serviceType,
          status: res.status,
          remarks: res.remarks
        });
        this.loading = false;
      },
      error: () => {
        this.snack.open('Error loading appointment', 'Close', { duration: 3000 });
        this.router.navigate(['/service']);
      }
    });
  }

  onCustomerChange() {
     // Optional: Load customer's vehicle if available
  }

  save() {
    console.log('Save triggered. Form valid:', this.form.valid, 'Value:', this.form.value);
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Please fill all required fields and select a customer', 'OK', { duration: 3000 });
      return;
    }
    this.loading = true;
    
    // Prepare data
    const formVal = this.form.value;
    const payload: any = {
      customer: { id: formVal.customerId },
      vehicleRegNo: formVal.vehicleRegNo,
      appointmentDate: formVal.appointmentDate,
      serviceType: formVal.serviceType,
      status: formVal.status,
      remarks: formVal.remarks
    };
    
    // Set current user as advisor for new appointments
    if (!this.isEdit && this.auth.currentUser?.employeeId) {
      payload.appointedBy = { id: this.auth.currentUser.employeeId };
    }

    console.log('Submitting payload:', payload);

    const req = this.isEdit 
      ? this.api.updateAppointment(this.id!, payload)
      : this.api.createAppointment({ ...payload, appointmentNo: 'REQ-' + Date.now().toString().slice(-6) });

    req.subscribe({
      next: () => {
        this.snack.open(`Appointment ${this.isEdit ? 'updated' : 'scheduled'} successfully`, 'OK', { duration: 3000 });
        this.router.navigate(['/service']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Save error details:', err);
        const msg = err.error?.message || 'Server error. Please try again.';
        this.snack.open('Error: ' + msg, 'Close', { duration: 5000 });
      }
    });
  }
}
