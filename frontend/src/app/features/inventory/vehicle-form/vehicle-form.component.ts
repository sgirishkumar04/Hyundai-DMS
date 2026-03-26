import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { VehicleVariant, Color, InventoryLocation } from '../../../core/models/models';

@Component({
  selector: 'app-vehicle-form',
  template: `
    <div class="page-header">
      <h1><mat-icon>directions_car</mat-icon> {{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}}</h1>
    </div>

    <mat-card style="max-width:800px">
      <mat-card-content style="padding:24px">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>VIN</mat-label>
              <input matInput formControlName="vin" maxlength="17" [readonly]="isEdit">
              <mat-error *ngIf="form.get('vin')?.hasError('required')">VIN is required</mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Engine Number</mat-label>
              <input matInput formControlName="engineNumber">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Chassis Number</mat-label>
              <input matInput formControlName="chassisNumber">
            </mat-form-field>
          </div>

          <div class="form-row">

            <mat-form-field appearance="outline">
              <mat-label>Variant</mat-label>
              <mat-select formControlName="variantId">
                <mat-option *ngFor="let v of variants" [value]="v.id">
                  {{v.model.modelName}} – {{v.variantName}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Color</mat-label>
              <mat-select formControlName="colorId">
                <mat-option *ngFor="let c of colors" [value]="c.id">{{c.name}}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Location</mat-label>
              <mat-select formControlName="locationId">
                <mat-option *ngFor="let l of locations" [value]="l.id">{{l.name}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Mfg Year</mat-label>
              <input matInput formControlName="mfgYear" type="number" placeholder="2025">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mfg Date</mat-label>
              <input matInput formControlName="mfgDate" type="date">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Arrival Date</mat-label>
              <input matInput formControlName="arrivalDate" type="date">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="IN_STOCK">In Stock</mat-option>
                <mat-option value="ALLOCATED">Allocated</mat-option>
                <mat-option value="SOLD">Sold</mat-option>
                <mat-option value="IN_TRANSIT">In Transit</mat-option>
                <mat-option value="DEMO">Demo</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Dealer Cost (₹)</mat-label>
              <input matInput formControlName="dealerCost" type="number">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Invoice Date</mat-label>
              <input matInput formControlName="invoiceDate" type="date">
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" routerLink="/inventory">Cancel</button>
            <button mat-raised-button style="background:var(--hd-blue);color:#fff" type="submit">
              {{isEdit ? 'Update Vehicle' : 'Add Vehicle'}}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class VehicleFormComponent implements OnInit {
  form = this.fb.group({
    vin:           ['', [Validators.required, Validators.maxLength(17)]],
    engineNumber:  [''],
    chassisNumber: [''],
    variantId:  [null as number | null, Validators.required],
    colorId:    [null as number | null, Validators.required],
    locationId: [null as number | null, Validators.required],
    mfgYear:    [null as number | null],
    mfgDate:    [null as string | null],
    arrivalDate:[null as string | null],
    status:     ['IN_STOCK'],
    dealerCost: [null as number | null],
    invoiceDate:[null as string | null]
  });

  variants: VehicleVariant[] = [];
  colors: Color[] = [];
  locations: InventoryLocation[] = [];
  isEdit = false;
  vehicleId: number | null = null;

  constructor(private fb: FormBuilder, private api: ApiService,
              private router: Router, private route: ActivatedRoute,
              private snack: MatSnackBar) {}

  ngOnInit() {
    this.api.getVariants().subscribe((v: VehicleVariant[]) => this.variants = v);
    this.api.getColors().subscribe((c: Color[]) => this.colors = c);
    this.api.getLocations().subscribe((l: InventoryLocation[]) => this.locations = l);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.vehicleId = +id;
      // In edit mode, VIN and variantId are not editable – clear their validators so form stays valid
      this.form.get('vin')?.clearValidators();
      this.form.get('vin')?.updateValueAndValidity();
      this.form.get('variantId')?.clearValidators();
      this.form.get('variantId')?.updateValueAndValidity();

      this.api.getVehicle(+id).subscribe((v: any) => {
        this.form.patchValue({
          vin: v.vin,
          engineNumber: v.engineNumber ?? '',
          chassisNumber: v.chassisNumber ?? '',
          variantId: v.variant?.id ?? null,
          colorId: v.color?.id ?? null,
          locationId: v.location?.id ?? null,
          mfgYear: v.mfgYear ?? null,
          mfgDate: v.mfgDate ?? null,
          arrivalDate: v.arrivalDate ?? null,
          status: v.status,
          dealerCost: v.dealerCost ?? null,
          invoiceDate: v.invoiceDate ?? null
        });
      });
    } else {
      this.form.patchValue({ vin: this.generateVIN() });
    }
  }

  generateVIN(): string {
    const chars = '0123456789';
    let vin = 'VIN';
    for (let i = 0; i < 14; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(k => {
        const ctrl = this.form.get(k);
        if (ctrl?.invalid) {
          ctrl.markAsTouched();
          console.warn('Invalid field:', k, ctrl.errors);
        }
      });
      this.snack.open('Please fill all required fields.', 'Close', { duration: 4000 });
      return;
    }

    const payload: any = { ...this.form.value };
    if (!payload.mfgYear) payload.mfgYear = null;
    if (!payload.dealerCost) payload.dealerCost = null;
    if (!payload.invoiceDate) payload.invoiceDate = null;

    const obs = this.isEdit
      ? this.api.updateVehicle(this.vehicleId!, payload)
      : this.api.createVehicle(payload);

    obs.subscribe({
      next: () => {
        this.snack.open('Vehicle saved successfully', 'OK', { duration: 3000 });
        this.router.navigate(['/inventory']);
      },
      error: (err: any) => {
        console.error('Save failed', err);
        let msg = 'Error saving vehicle. Please check the form.';
        if (err?.error?.errors && Array.isArray(err.error.errors)) {
          msg = err.error.errors.join(', ');
        } else if (err?.error?.message) {
          msg = err.error.message;
        }
        this.snack.open(msg, 'Close', { duration: 7000 });
      }
    });
  }
}
