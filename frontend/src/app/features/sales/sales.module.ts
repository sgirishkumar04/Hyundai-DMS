import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookingListComponent } from './booking-list/booking-list.component';

@NgModule({
  declarations: [BookingListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: BookingListComponent }]),
    MatCardModule, MatIconModule, MatButtonModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressBarModule, MatTooltipModule
  ]
})
export class SalesModule {}
