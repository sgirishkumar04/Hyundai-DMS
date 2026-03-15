import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

@NgModule({
  declarations: [EmployeeListComponent, EmployeeFormComponent],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    RouterModule.forChild([
      { path: '', component: EmployeeListComponent },
      { path: 'new', component: EmployeeFormComponent },
      { path: ':id/edit', component: EmployeeFormComponent }
    ]),
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatCardModule,
    MatSnackBarModule, MatTooltipModule, MatDialogModule, MatProgressBarModule
  ]
})
export class EmployeesModule {}
