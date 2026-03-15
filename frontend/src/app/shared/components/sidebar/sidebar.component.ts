import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  section?: string;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar-container" [class.collapsed]="collapsed">

      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">H</div>
        <div class="logo-text" *ngIf="!collapsed">
          <span class="logo-brand">Hyundai DMS</span>
          <span class="logo-sub">Dealer Management</span>
        </div>
      </div>

      <!-- Nav Items -->
      <nav class="nav-section">
        <ng-container *ngFor="let item of visibleNavItems()">
          <div *ngIf="item.section && !collapsed" class="nav-label">{{item.section}}</div>
          <a class="nav-item"
             [routerLink]="item.route"
             routerLinkActive="active"
             [matTooltip]="collapsed ? item.label : ''"
             matTooltipPosition="right">
            <mat-icon>{{item.icon}}</mat-icon>
            <span class="nav-text" *ngIf="!collapsed">{{item.label}}</span>
          </a>
        </ng-container>
      </nav>

      <!-- User footer -->
      <div class="sidebar-footer">
        <div class="user-info"
             [matTooltip]="collapsed ? (auth.currentUser?.fullName ?? '') : ''"
             matTooltipPosition="right">
          <div class="user-avatar">{{initials}}</div>
          <div class="user-details" *ngIf="!collapsed">
            <div class="user-name">{{auth.currentUser?.fullName}}</div>
            <div class="user-role">{{roleName}}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;

  // Roles use short names (no ROLE_ prefix) — matched against auth.role which also has no prefix
  navItems: NavItem[] = [
    { section: 'Core',             label: 'Dashboard',         icon: 'dashboard',       route: '/dashboard' },
    { section: 'Sales Operations', label: 'Vehicle Inventory', icon: 'directions_car',  route: '/inventory',  roles: ['ADMIN','SALES_MANAGER','SALES_EXECUTIVE','INVENTORY_MANAGER'] },
    {                              label: 'Customers',         icon: 'people',          route: '/customers',  roles: ['ADMIN','SALES_MANAGER','SALES_EXECUTIVE'] },
    {                              label: 'Leads / Enquiries', icon: 'trending_up',     route: '/leads',      roles: ['ADMIN','SALES_MANAGER','SALES_EXECUTIVE'] },
    {                              label: 'Sales',             icon: 'shopping_cart',   route: '/sales',      roles: ['ADMIN','SALES_MANAGER','SALES_EXECUTIVE','ACCOUNTS'] },
    { section: 'Service',          label: 'Service Center',    icon: 'build_circle',    route: '/service',    roles: ['ADMIN','SERVICE_ADVISOR','MECHANIC'] },
    {                              label: 'Spare Parts',       icon: 'settings',        route: '/parts',      roles: ['ADMIN','SERVICE_ADVISOR','MECHANIC','INVENTORY_MANAGER'] },
    { section: 'Finance',          label: 'Finance',           icon: 'account_balance', route: '/finance',    roles: ['ADMIN','ACCOUNTS'] },
    { section: 'Admin',            label: 'Employees',         icon: 'badge',           route: '/employees',  roles: ['ADMIN','SALES_MANAGER'] },
    {                              label: 'Reports',           icon: 'bar_chart',       route: '/reports',    roles: ['ADMIN','SALES_MANAGER','ACCOUNTS'] },
  ];

  constructor(public auth: AuthService) {}
  ngOnInit() {}

  visibleNavItems(): NavItem[] {
    // Normalize role: strip ROLE_ prefix if present (handles both ADMIN and ROLE_ADMIN formats)
    const role = (this.auth.role ?? '').replace('ROLE_', '');

    const shownSections = new Set<string>();
    return this.navItems
      .filter(item => !item.roles || item.roles.includes(role))
      .map(item => {
        // Only show section label the first time it appears
        if (item.section) {
          if (shownSections.has(item.section)) {
            return { ...item, section: undefined };
          }
          shownSections.add(item.section);
        }
        return item;
      });
  }

  get initials(): string {
    const name = this.auth.currentUser?.fullName ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get roleName(): string {
    return (this.auth.role ?? '').replace('ROLE_', '').replace(/_/g, ' ');
  }
}
