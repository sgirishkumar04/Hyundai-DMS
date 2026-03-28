import { Component, OnInit } from '@angular/core';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  dealers: any[] = [];
  entities: string[] = ['Lead', 'Booking', 'Vehicle', 'Customer', 'Employee'];
  actions: string[] = ['CREATE', 'UPDATE', 'DELETE'];
  
  filters = {
    dealerId: '',
    entityName: '',
    action: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 20
  };

  totalElements = 0;
  isLoading = false;
  displayedColumns: string[] = ['id', 'userName', 'entityName', 'entityId', 'action', 'createdAt', 'expand'];
  expandedElement: AuditLog | null = null;

  constructor(
    private auditLogService: AuditLogService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDealers();
    this.loadLogs();
  }

  loadDealers(): void {
    this.apiService.get('/dealers').subscribe({
      next: (data: any) => this.dealers = data.content || data,
      error: () => this.snackBar.open('Failed to load dealers', 'Close', { duration: 3000 })
    });
  }

  loadLogs(): void {
    this.isLoading = true;
    this.auditLogService.getLogs(this.filters).subscribe({
      next: (res) => {
        this.logs = res.content;
        this.totalElements = res.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load audit logs', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    this.filters.page = 0;
    this.loadLogs();
  }

  resetFilters(): void {
    this.filters = {
      dealerId: '',
      entityName: '',
      action: '',
      startDate: '',
      endDate: '',
      page: 0,
      size: 20
    };
    this.loadLogs();
  }

  onPageChange(event: any): void {
    this.filters.page = event.pageIndex;
    this.filters.size = event.pageSize;
    this.loadLogs();
  }

  parseJson(json: string | undefined): any {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch (e) {
      return json;
    }
  }

  getDiff(oldVal: any, newVal: any): any[] {
    const diff = [];
    const o = this.parseJson(oldVal) || {};
    const n = this.parseJson(newVal) || {};
    
    const allKeys = new Set([...Object.keys(o), ...Object.keys(n)]);
    for (const key of allKeys) {
      if (['id', 'createdAt', 'updatedAt', 'dealer'].includes(key)) continue;

      const ov = o[key];
      const nv = n[key];

      // Smart comparison: if both are objects, compare their IDs
      if (typeof ov === 'object' && typeof nv === 'object' && ov !== null && nv !== null) {
        if (ov.id === nv.id) continue; // Same entity, different representation
      }

      if (JSON.stringify(ov) !== JSON.stringify(nv)) {
        diff.push({
          field: this.formatFieldName(key),
          old: this.formatValue(ov),
          new: this.formatValue(nv)
        });
      }
    }
    return diff;
  }

  formatFieldName(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
  }

  formatValue(val: any): string {
    if (val === null || val === undefined) return '—';
    
    // Handle Arrays (like Addresses)
    if (Array.isArray(val)) {
      if (val.length === 0) return '—';
      return val.map(item => this.formatValue(item)).join('; ');
    }

    if (typeof val === 'object') {
      // Handle Address objects specifically
      if (val.line1 !== undefined) {
        const parts = [val.line1, val.city, val.state, val.pincode].filter(p => !!p);
        return parts.length > 0 ? parts.join(', ') : '—';
      }

      if (val.name) return val.name;
      if (val.modelName) return val.modelName;
      if (val.variantName) return val.variantName;
      if (val.firstName) return `${val.firstName} ${val.lastName || ''}`;
      if (val.label) return val.label;
      if (val.id) return `#${val.id}`;
      return JSON.stringify(val);
    }

    if (typeof val === 'number') {
      if (val > 1000) return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
      return String(val);
    }

    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {}
    }

    return String(val);
  }

  getSnapshot(json: string | undefined): any[] {
    const data = this.parseJson(json);
    if (!data) return [];
    
    return Object.keys(data)
      .filter(k => !['id', 'createdAt', 'updatedAt', 'dealer'].includes(k))
      .map(k => ({
        field: this.formatFieldName(k),
        value: this.formatValue(data[k])
      }));
  }
}
