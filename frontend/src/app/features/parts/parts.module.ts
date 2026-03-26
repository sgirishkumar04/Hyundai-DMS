import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { PartsListComponent } from './parts-list.component';
import { PartFormComponent } from './part-form/part-form.component';

@NgModule({
  declarations: [PartsListComponent, PartFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: PartsListComponent },
      { path: 'add', component: PartFormComponent },
      { path: 'edit/:id', component: PartFormComponent }
    ]),
    MatCardModule, MatIconModule, MatButtonModule, MatTableModule,
    MatPaginatorModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatProgressBarModule, MatSnackBarModule,
    MatDividerModule, MatTooltipModule, MatDialogModule
  ]
})
export class PartsModule {}

