import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', redirectTo: '/', pathMatch: 'full' }]),
    MatCardModule, MatIconModule, MatButtonModule
  ]
})
export class PartsModule {}
