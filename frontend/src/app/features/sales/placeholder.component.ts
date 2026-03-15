import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  template: `
    <div class="page-header"><h1><mat-icon>build</mat-icon> Coming Soon</h1></div>
    <mat-card style="max-width:500px;padding:40px;text-align:center">
      <mat-icon style="font-size:3rem;color:var(--hd-accent)">construction</mat-icon>
      <p style="margin-top:16px;color:var(--hd-text-lt)">This module is ready to be extended.<br>All API services are wired – add components following the Inventory module pattern.</p>
    </mat-card>
  `
})
export class PlaceholderComponent {}
