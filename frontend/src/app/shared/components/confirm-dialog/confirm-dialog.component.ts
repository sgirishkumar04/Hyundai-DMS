import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title:   string;
  message: string;
  confirmText?: string;
  cancelText?:  string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div style="padding:24px;max-width:420px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div [style.background]="data.danger ? '#fee2e2' : '#fef9c3'"
             style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <mat-icon [style.color]="data.danger ? '#b91c1c' : '#a16207'">
            {{data.danger ? 'delete_outline' : 'help_outline'}}
          </mat-icon>
        </div>
        <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary)">{{data.title}}</h3>
      </div>
      <p style="font-size:.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:20px">
        {{data.message}}
      </p>
      <div style="display:flex;justify-content:flex-end;gap:10px">
        <button mat-stroked-button (click)="ref.close(false)">
          {{data.cancelText ?? 'Cancel'}}
        </button>
        <button mat-raised-button
                [style.background]="data.danger ? '#c00f2f' : 'var(--hd-blue)'"
                style="color:#fff"
                (click)="ref.close(true)">
          {{data.confirmText ?? 'Confirm'}}
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
