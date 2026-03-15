import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  template: `
    <div class="header-bar">

      <!-- Sidebar toggle -->
      <button class="toggle-btn" (click)="toggleSidebar.emit()">
        <mat-icon>{{sidebarCollapsed ? 'menu_open' : 'menu'}}</mat-icon>
      </button>

      <!-- Breadcrumb / Page title -->
      <div class="breadcrumb">
        <span>Hyundai DMS</span>
        <mat-icon>chevron_right</mat-icon>
        <span class="breadcrumb-page">{{pageTitle}}</span>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Date/time -->
      <span class="text-sm text-secondary nowrap d-flex align-center" style="gap:6px">
        <mat-icon style="font-size:16px;width:16px;height:16px;color:var(--text-muted)">today</mat-icon>
        {{today}}
      </span>

      <!-- Actions -->
      <div class="header-actions">
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon style="color:var(--text-secondary)">notifications_none</mat-icon>
        </button>

        <!-- User menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" style="padding:4px 8px;border-radius:8px;gap:6px;display:flex;align-items:center">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--hd-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700">
            {{initials}}
          </div>
          <div style="text-align:left;line-height:1.2">
            <div style="font-size:.78rem;font-weight:600;color:var(--text-primary)">{{auth.currentUser?.fullName}}</div>
            <div style="font-size:.65rem;color:var(--text-secondary)">{{roleName}}</div>
          </div>
          <mat-icon style="font-size:18px;width:18px;height:18px;color:var(--text-muted)">expand_more</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <div mat-menu-item disabled style="opacity:.7;font-size:.75rem;line-height:1.3;padding:8px 16px">
            <div>{{auth.currentUser?.email}}</div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>
    </div>
  `
})
export class HeaderComponent implements OnInit {
  @Input()  sidebarCollapsed = false;
  @Output() toggleSidebar    = new EventEmitter<void>();

  pageTitle = 'Dashboard';
  today = '';

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.pageTitle = this.routeToTitle(e.urlAfterRedirects);
    });
    this.pageTitle = this.routeToTitle(this.router.url);
  }

  private routeToTitle(url: string): string {
    const map: Record<string, string> = {
      '/dashboard':  'Dashboard',
      '/inventory':  'Vehicle Inventory',
      '/customers':  'Customers',
      '/leads':      'Leads & Enquiries',
      '/sales':      'Sales',
      '/service':    'Service Center',
      '/parts':      'Spare Parts',
      '/finance':    'Finance & Insurance',
      '/employees':  'Employees',
      '/reports':    'Reports',
    };
    const seg = '/' + url.split('/')[1];
    return map[seg] ?? 'Hyundai DMS';
  }

  logout() { this.auth.logout(); }

  get initials(): string {
    const name = this.auth.currentUser?.fullName ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get roleName(): string {
    return (this.auth.role ?? '').replace('ROLE_', '').replace(/_/g, ' ');
  }
}
