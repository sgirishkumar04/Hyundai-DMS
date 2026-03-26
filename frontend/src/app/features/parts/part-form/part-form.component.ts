import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Supplier } from '../../../core/models/models';

@Component({
  selector: 'app-part-form',
  template: `
    <div class="page-header px-4 mt-4">
      <h1>{{isEdit ? 'Edit' : 'New'}} Spare Part</h1>
    </div>

    <div class="px-4">
      <mat-card style="max-width:900px" class="hd-card shadow-sm">
        <mat-card-content style="padding:24px">
          <mat-progress-bar mode="indeterminate" *ngIf="loading" class="mb-4"></mat-progress-bar>
          
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Part Number</mat-label>
                <input matInput formControlName="partNumber" placeholder="e.g. P-BRK-PAD-02" style="text-transform:uppercase">
                <mat-error *ngIf="form.get('partNumber')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Part Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Brake Pads (Front)">
                <mat-error *ngIf="form.get('name')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
                </mat-select>
                <mat-error *ngIf="form.get('category')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Unit of Measure</mat-label>
                <mat-select formControlName="unit">
                  <mat-option value="Piece">Piece</mat-option>
                  <mat-option value="Set">Set</mat-option>
                  <mat-option value="Litre">Litre</mat-option>
                  <mat-option value="Can">Can</mat-option>
                  <mat-option value="Kit">Kit</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Unit Price (₹)</mat-label>
                <input matInput type="number" formControlName="unitPrice" placeholder="0.00">
                <mat-error *ngIf="form.get('unitPrice')?.hasError('required')">Required</mat-error>
                <mat-error *ngIf="form.get('unitPrice')?.hasError('min')">Must be positive</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>GST Rate (%)</mat-label>
                <mat-select formControlName="gstRate">
                  <mat-option [value]="5">5%</mat-option>
                  <mat-option [value]="12">12%</mat-option>
                  <mat-option [value]="18">18%</mat-option>
                  <mat-option [value]="28">28%</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Supplier</mat-label>
                <mat-select formControlName="supplierId">
                  <mat-option *ngFor="let s of suppliers" [value]="s.id">{{s.name}}</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="flex items-center h-full px-2" style="margin-top: -12px">
                <mat-checkbox formControlName="isActive" color="primary">Active in Catalog</mat-checkbox>
              </div>
            </div>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Additional specifications..."></textarea>
            </mat-form-field>

            <div class="form-actions" style="margin-top:24px; display:flex; justify-content:flex-end; gap:16px">
              <button mat-stroked-button type="button" (click)="back()" style="border-radius:8px">Cancel</button>
              <button mat-raised-button type="submit" 
                      [disabled]="form.invalid || loading"
                      style="background:var(--hd-blue); color:#fff; padding:0 32px">
                <mat-icon *ngIf="!loading">save</mat-icon>
                {{loading ? 'Please wait...' : (isEdit ? 'Update' : 'Save') + ' Spare Part'}}
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
    .mb-4 { margin-bottom: 1rem; }
  `]
})
export class PartFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEdit = false;
  partId?: number;
  private autoGeneratedNum = Math.floor(1000 + Math.random() * 9000).toString();
  suppliers: Supplier[] = [];
  categories = ['Brakes', 'Engine', 'Consumables', 'Electrical', 'Body', 'Transmission', 'Accessories'];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      partNumber: ['', Validators.required],
      name: ['', Validators.required],
      category: ['Others', Validators.required],
      unit: ['Piece'],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      gstRate: [18],
      isActive: [true],
      supplierId: [null],
      description: ['']
    });
  }

  ngOnInit() {
    this.api.getSuppliers().subscribe(s => this.suppliers = s);
    
    this.partId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.partId) {
      this.isEdit = true;
      this.loadPart();
    } else {
      this.setupAutoNumbering();
    }
  }

  setupAutoNumbering() {
    // Generate initial part number based on default category
    const initialCat = this.form.get('category')?.value;
    if (initialCat) {
      this.updatePartNumberPrefix(initialCat);
    }

    this.form.get('category')?.valueChanges.subscribe(val => {
      if (val) this.updatePartNumberPrefix(val);
    });
  }

  updatePartNumberPrefix(category: string) {
    const pNumCtrl = this.form.get('partNumber');
    if (pNumCtrl && !pNumCtrl.dirty) {
      const map: Record<string, string> = {
        'Brakes': 'BRK', 'Engine': 'ENG', 'Consumables': 'CNS', 
        'Electrical': 'ELE', 'Body': 'BDY', 'Transmission': 'TRN', 
        'Accessories': 'ACC'
      };
      const prefix = map[category] || 'OTH';
      pNumCtrl.setValue(`P-${prefix}-${this.autoGeneratedNum}`, { emitEvent: false });
    }
  }

  loadPart() {
    this.loading = true;
    this.api.getPart(this.partId!).subscribe({
      next: p => {
        console.log('Loaded part:', p);
        this.form.patchValue(p);
        // Handle both 'active' and 'isActive' for resilience
        if (p.isActive !== undefined) this.form.patchValue({ isActive: p.isActive });
        else if ((p as any).active !== undefined) this.form.patchValue({ isActive: (p as any).active });
        
        if (p.supplier) this.form.patchValue({ supplierId: p.supplier.id });
        this.loading = false;
      },
      error: (err) => {
        console.error('Load part failed:', err);
        this.snack.open('Error loading part details', 'Close', { duration: 3000 });
        this.loading = false; // Ensure loading is reset even on error
        this.router.navigate(['/parts']);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }
    this.loading = true;
    
    const val = this.form.value;
    const body = {
      ...val,
      supplier: val.supplierId ? { id: val.supplierId } : null
    };

    const req = this.isEdit 
      ? this.api.updateSparePart(this.partId!, body)
      : this.api.createSparePart(body);

    req.subscribe({
      next: () => {
        this.snack.open(`Part ${this.isEdit ? 'updated' : 'saved'} successfully`, '✓', { duration: 3000 });
        this.back();
      },
      error: (err) => {
        console.error('Save error:', err);
        this.snack.open('Error saving part. Check console.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  back() {
    this.router.navigate(['/parts']);
  }
}
