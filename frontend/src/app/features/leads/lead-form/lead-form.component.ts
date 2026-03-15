import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Customer, Employee, LeadSource, VehicleModel, VehicleVariant, Color } from '../../../core/models/models';

@Component({
  selector: 'app-lead-form',
  template: `
    <div class="page-header"><h1>{{isEdit ? 'Edit' : 'New'}} Lead</h1></div>
    <mat-card style="max-width:900px">
      <mat-card-content style="padding:24px">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Lead Number</mat-label>
              <input matInput formControlName="leadNumber"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Lead Source</mat-label>
              <mat-select formControlName="sourceId">
                <mat-option *ngFor="let s of sources" [value]="s.id">{{s.name}}</mat-option>
              </mat-select></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Customer Phone / Name</mat-label>
              <mat-select formControlName="customerId">
                <mat-option *ngFor="let c of customers" [value]="c.id">
                  {{c.firstName}} {{c.lastName}} – {{c.phone}}
                </mat-option>
              </mat-select></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Assign To (Sales Executive)</mat-label>
              <mat-select formControlName="assignedTo">
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
            <button mat-stroked-button type="button" routerLink="/leads">Cancel</button>
            <button mat-raised-button style="background:var(--hd-blue);color:#fff" type="submit">Save Lead</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class LeadFormComponent implements OnInit {
  form = this.fb.group({
    leadNumber: ['', Validators.required], sourceId: ['', Validators.required],
    customerId: ['', Validators.required], assignedTo: ['', Validators.required],
    preferredModelId: [''], preferredVariantId: [''], preferredColorId: [''],
    status: ['NEW'], remarks: [''], expectedCloseDate: ['']
  });
  sources: LeadSource[] = []; customers: Customer[] = [];
  executives: Employee[] = []; models: VehicleModel[] = [];
  variants: VehicleVariant[] = []; colors: Color[] = [];
  isEdit = false; leadId: number | null = null;

  constructor(private fb: FormBuilder, private api: ApiService,
              private router: Router, private route: ActivatedRoute,
              private snack: MatSnackBar) {}

  ngOnInit() {
    this.api.getLeadSources().subscribe(s => this.sources = s);
    this.api.getCustomers({page:0,size:100}).subscribe(p => this.customers = p.content);
    this.api.getEmployees({page:0,size:100}).subscribe(p =>
      this.executives = p.content.filter((e: any) => e.role?.name === 'SALES_EXECUTIVE'));
    this.api.getModels().subscribe(m => this.models = m);
    this.api.getColors().subscribe(c => this.colors = c);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true; this.leadId = +id;
      this.api.getLead(+id).subscribe((l: any) => {
        if (l.preferredModel?.id) {
          this.onModelChange(l.preferredModel.id);
        }
        this.form.patchValue({
          leadNumber: l.leadNumber, sourceId: l.source?.id,
          customerId: l.customer?.id, assignedTo: l.assignedTo?.id,
          preferredModelId: l.preferredModel?.id, preferredVariantId: l.preferredVariant?.id,
          preferredColorId: l.preferredColor?.id, status: l.status,
          remarks: l.remarks, expectedCloseDate: l.expectedCloseDate
        });
      });
    }
  }

  onModelChange(modelId: number) {
    if (modelId) this.api.getVariants(modelId).subscribe(v => this.variants = v);
  }

  onSubmit() {
    if (this.form.invalid) return;
    const obs = this.isEdit ? this.api.updateLead(this.leadId!, this.form.value) : this.api.createLead(this.form.value);
    obs.subscribe(() => { this.snack.open('Lead saved!','OK',{duration:3000}); this.router.navigate(['/leads']); });
  }
}
