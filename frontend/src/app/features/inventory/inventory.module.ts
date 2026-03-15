import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule }     from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule }      from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatSelectModule }    from '@angular/material/select';
import { MatDialogModule }    from '@angular/material/dialog';
import { MatChipsModule }     from '@angular/material/chips';
import { MatCardModule }      from '@angular/material/card';
import { MatSnackBarModule }  from '@angular/material/snack-bar';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { VehicleDetailsDialogComponent } from './vehicle-details-dialog/vehicle-details-dialog.component';

@NgModule({
  declarations: [VehicleListComponent, VehicleFormComponent],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    RouterModule.forChild([
      { path: '', component: VehicleListComponent },
      { path: 'new', component: VehicleFormComponent },
      { path: ':id/edit', component: VehicleFormComponent }
    ]),
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatDialogModule, MatChipsModule, MatCardModule, MatSnackBarModule, MatTooltipModule, MatProgressBarModule,
    MatDividerModule, MatProgressSpinnerModule
  ]
})
export class InventoryModule {}
