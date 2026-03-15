import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule }     from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatSelectModule }    from '@angular/material/select';
import { MatCardModule }      from '@angular/material/card';
import { MatSnackBarModule }  from '@angular/material/snack-bar';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { MatSortModule }      from '@angular/material/sort';
import { MatDialogModule }    from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';

@NgModule({
  declarations: [CustomerListComponent, CustomerFormComponent],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    RouterModule.forChild([
      { path: '', component: CustomerListComponent },
      { path: 'new', component: CustomerFormComponent },
      { path: ':id/edit', component: CustomerFormComponent }
    ]),
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatCardModule,
    MatSnackBarModule, MatTooltipModule, MatDialogModule, MatProgressBarModule
  ]
})
export class CustomersModule {}
