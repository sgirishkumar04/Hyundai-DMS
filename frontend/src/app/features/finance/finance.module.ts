import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', redirectTo: '/', pathMatch: 'full' }]),
    MatCardModule, MatIconModule
  ]
})
export class FinanceModule {}
