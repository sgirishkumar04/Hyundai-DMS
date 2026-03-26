import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Customer, Employee, LeadSource, VehicleModel, VehicleVariant, Color } from '../../../core/models/models';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-lead-form',
  template: `
    <div class="page-header"><h1>{{isEdit ? 'Edit' : 'New'}} Lead</h1></div>
    <mat-card style="max-width:900px">
      <mat-card-content style="padding:24px">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Lead Number</mat-label>
              <input matInput formControlName="leadNumber" readonly></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Lead Source</mat-label>
              <mat-select formControlName="sourceId" required>
                <mat-option *ngFor="let s of sources" [value]="s.id">{{s.name}}</mat-option>
              </mat-select></mat-form-field>
          </div>

          <!-- Customer Selection Mode -->
          <div style="margin-bottom:15px">
            <mat-button-toggle-group [(ngModel)]="customerMode" [ngModelOptions]="{standalone:true}" (change)="onCustomerModeChange()">
              <mat-button-toggle value="NEW">New Inquiry</mat-button-toggle>
              <mat-button-toggle value="EXISTING">Existing Customer</mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <!-- Searchable Autocomplete for Existing Customers -->
          <div class="form-row" *ngIf="customerMode === 'EXISTING'">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Search Customer (Name or Phone)</mat-label>
              <input type="text" matInput [formControl]="customerSearchCtrl" [matAutocomplete]="auto">
              <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayCustomer" (optionSelected)="onCustomerSelect($event.option.value)">
                <mat-option *ngIf="searchingCustomers" class="is-loading">Searching...</mat-option>
                <mat-option *ngFor="let c of filteredCustomers$ | async" [value]="c">
                  {{c.firstName}} {{c.lastName}} – {{c.phone}}
                </mat-option>
              </mat-autocomplete>
              <mat-hint *ngIf="!form.value.customerId" style="color:#ef4444">Please search and select a customer</mat-hint>
            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="customerMode === 'NEW'">
            <mat-form-field appearance="outline"><mat-label>Full Name</mat-label>
              <input matInput formControlName="customerName"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone Number</mat-label>
              <input matInput formControlName="customerPhone"></mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Assign To (Sales Executive)</mat-label>
              <mat-select formControlName="assignedTo" required>
                <mat-option *ngFor="let e of executives" [value]="e.id">{{e.firstName}} {{e.lastName}}</mat-option>
              </mat-select></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Preferred Model</mat-label>
              <mat-select formControlName="preferredModelId" (selectionChange)="onModelChange($event.value)">
                <mat-option value="">– Any –</mat-option>
                <mat-option *ngFor="let m of models" [value]="m.id">{{m.modelName}}</mat-option>
              </mat-select></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Preferred Variant</mat-label>
              <mat-select formControlName="preferredVariantId">
                <mat-option value="">– Any –</mat-option>
                <mat-option *ngFor="let v of variants" [value]="v.id">{{v.variantName}}</mat-option>
              </mat-select></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Preferred Color</mat-label>
              <mat-select formControlName="preferredColorId">
                <mat-option value="">– Any –</mat-option>
                <mat-option *ngFor="let c of colors" [value]="c.id">{{c.name}}</mat-option>
              </mat-select></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="NEW">New</mat-option>
                <mat-option value="CONTACTED">Contacted</mat-option>
                <mat-option value="TEST_DRIVE">Test Drive</mat-option>
                <mat-option value="NEGOTIATION">Negotiation</mat-option>
                <mat-option value="BOOKED">Booked</mat-option>
                <mat-option value="LOST">Lost</mat-option>
              </mat-select></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Expected Close Date</mat-label>
              <input matInput type="date" formControlName="expectedCloseDate"></mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="w-100"><mat-label>Remarks</mat-label>
            <textarea matInput formControlName="remarks" rows="3"></textarea></mat-form-field>
          <div class="form-actions">
            <button mat-stroked-button type="button" routerLink="/leads" style="border-radius:8px; padding:0 24px">Cancel</button>
            <button mat-raised-button type="submit" [disabled]="form.invalid"
                    style="background:var(--hd-blue);color:#fff">
              Save Lead
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
    .w-100 { width: 100%; }
    .flex-1 { flex: 1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .is-loading { font-size: 12px; color: #666; font-style: italic; }
  `]
})
export class LeadFormComponent implements OnInit {
  form = this.fb.group({
    leadNumber: [''],
    sourceId: ['', Validators.required],
    customerId: [null],
    customerName: ['', Validators.required],
    customerPhone: ['', Validators.required],
    assignedTo: ['', Validators.required],
    preferredModelId: [''], preferredVariantId: [''], preferredColorId: [''],
    status: ['NEW'], remarks: [''], expectedCloseDate: ['']
  });
  
  customerSearchCtrl = new FormControl();
  filteredCustomers$: Observable<any[]>;
  searchingCustomers = false;
  
  sources: LeadSource[] = [];
  executives: Employee[] = [];
  models: VehicleModel[] = [];
  variants: VehicleVariant[] = [];
  colors: Color[] = [];
  isEdit = false; leadId: number | null = null;
  customerMode: 'NEW' | 'EXISTING' = 'NEW';

  constructor(private fb: FormBuilder, private api: ApiService,
              private router: Router, private route: ActivatedRoute,
              private snack: MatSnackBar) {
    
    this.filteredCustomers$ = this.customerSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => {
        if (typeof val !== 'string' || val.length < 2) return of([]);
        this.searchingCustomers = true;
        return this.api.getCustomers({ search: val, size: 20 }).pipe(
          map(res => {
            this.searchingCustomers = false;
            return res.content || [];
          }),
          catchError(() => {
            this.searchingCustomers = false;
            return of([]);
          })
        );
      })
    );
  }

  ngOnInit() {
    this.api.getLeadSources().subscribe(s => this.sources = s);
    
    // Improved Assign To loading: fetch all and filter robustly
    this.api.getEmployees({page:0,size:500}).subscribe(p => {
      this.executives = (p.content || []).filter((e: any) => 
        e.role?.name === 'SALES_EXECUTIVE' || e.role?.name === 'ADMIN' || e.role?.name === 'SALES_MANAGER'
      );
    });

    this.api.getModels().subscribe(m => this.models = m);
    this.api.getColors().subscribe(c => this.colors = c);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true; this.leadId = +id;
      this.customerMode = 'EXISTING';
      this.api.getLead(+id).subscribe((l: any) => {
        if (l.preferredModel?.id) this.onModelChange(l.preferredModel.id);
        
        // Populate customer autocomplete display
        if (l.customer) {
          this.customerSearchCtrl.setValue(l.customer);
          this.form.patchValue({ customerId: l.customer.id });
        }
        
        this.form.patchValue({
          leadNumber: l.leadNumber, sourceId: l.source?.id,
          assignedTo: l.assignedTo?.id,
          preferredModelId: l.preferredModel?.id, preferredVariantId: l.preferredVariant?.id,
          preferredColorId: l.preferredColor?.id, status: l.status,
          remarks: l.remarks, expectedCloseDate: l.expectedCloseDate
        });
      });
    } else {
      this.api.getNextLeadNumber().subscribe(num => {
        this.form.get('leadNumber')?.setValue(num);
      });
    }
  }

  displayCustomer(c: any): string {
    return c ? `${c.firstName} ${c.lastName} (${c.phone})` : '';
  }

  onCustomerSelect(c: any) {
    this.form.patchValue({ customerId: c.id });
  }

  onCustomerModeChange() {
    if (this.customerMode === 'NEW') {
      this.form.get('customerId')?.setValue(null);
      this.customerSearchCtrl.setValue('');
      this.form.get('customerId')?.clearValidators();
      this.form.get('customerName')?.setValidators(Validators.required);
      this.form.get('customerPhone')?.setValidators(Validators.required);
    } else {
      this.form.get('customerName')?.setValue('');
      this.form.get('customerPhone')?.setValue('');
      this.form.get('customerName')?.clearValidators();
      this.form.get('customerPhone')?.clearValidators();
      this.form.get('customerId')?.setValidators(Validators.required);
    }
    this.form.get('customerId')?.updateValueAndValidity();
    this.form.get('customerName')?.updateValueAndValidity();
    this.form.get('customerPhone')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  onModelChange(modelId: number) {
    if (modelId) this.api.getVariants(modelId).subscribe(v => this.variants = v);
  }

  onSubmit() {
    if (this.form.invalid) return;
    const val: any = this.form.getRawValue();
    
    // Cleanup empty strings to null for backend Long fields
    ['preferredModelId', 'preferredVariantId', 'preferredColorId'].forEach(key => {
      if (val[key] === '') val[key] = null;
    });

    const obs = this.isEdit ? this.api.updateLead(this.leadId!, val) : this.api.createLead(val);
    obs.subscribe({
      next: () => {
        this.snack.open('Lead saved!', 'OK', { duration: 3000 });
        this.router.navigate(['/leads']);
      },
      error: (err) => {
        console.error('Save Lead Error:', err);
        let msg = err.error?.message;
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          msg = err.error.errors.join(' | ');
        } else if (!msg) {
          msg = JSON.stringify(err.error) || 'Failed to save lead. Please check all fields.';
        }
        this.snack.open(msg, 'Close', { duration: 8000 });
      }
    });
  }
}
