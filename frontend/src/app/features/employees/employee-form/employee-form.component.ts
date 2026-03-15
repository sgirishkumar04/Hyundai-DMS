import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Role, Department } from '../../../core/models/models';

@Component({ selector: 'app-employee-form', template: `
  <div class="page-header"><h1>{{isEdit ? 'Edit' : 'Add'}} Employee</h1></div>
  <mat-card style="max-width:800px">
    <mat-card-content style="padding:24px">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <mat-form-field appearance="outline"><mat-label>Employee Code</mat-label><input matInput formControlName="employeeCode"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput formControlName="firstName"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput formControlName="lastName"></mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email" type="email"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Date of Joining</mat-label><input matInput formControlName="dateOfJoin" type="date"></mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline"><mat-label>Department</mat-label>
            <mat-select formControlName="departmentId">
              <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
            </mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Role</mat-label>
            <mat-select formControlName="roleId">
              <mat-option *ngFor="let r of roles" [value]="r.id">{{r.name}}</mat-option>
            </mat-select></mat-form-field>
          <mat-form-field appearance="outline" *ngIf="!isEdit"><mat-label>Password</mat-label><input matInput formControlName="password" type="password"></mat-form-field>
        </div>
        <div class="form-actions">
          <button mat-stroked-button type="button" routerLink="/employees">Cancel</button>
          <button mat-raised-button style="background:var(--hd-blue);color:#fff" type="submit">Save Employee</button>
        </div>
      </form>
    </mat-card-content>
  </mat-card>
` })
export class EmployeeFormComponent implements OnInit {
  form = this.fb.group({
    employeeCode: ['', Validators.required], firstName: ['', Validators.required],
    lastName: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
    phone: [''], departmentId: ['', Validators.required], roleId: ['', Validators.required],
    password: ['', Validators.required], dateOfJoin: ['']
  });
  roles: Role[] = []; departments: Department[] = [];
  isEdit = false; empId: number | null = null;

  constructor(private fb: FormBuilder, private api: ApiService,
              private router: Router, private route: ActivatedRoute,
              private snack: MatSnackBar) {}

  ngOnInit() {
    this.api.getRoles().subscribe(r => this.roles = r);
    this.api.getDepartments().subscribe(d => this.departments = d);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true; this.empId = +id;
      this.form.get('password')?.clearValidators();
      this.api.getEmployee(+id).subscribe(e => this.form.patchValue({
        employeeCode: e.employeeCode, firstName: e.firstName, lastName: e.lastName,
        email: e.email, phone: e.phone,
        departmentId: e.department?.id as any, roleId: e.role?.id as any,
        dateOfJoin: e.dateOfJoin
      }));
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const obs = this.isEdit
      ? this.api.updateEmployee(this.empId!, this.form.value)
      : this.api.createEmployee(this.form.value);
    obs.subscribe(() => { this.snack.open('Employee saved!','OK',{duration:3000}); this.router.navigate(['/employees']); });
  }
}
