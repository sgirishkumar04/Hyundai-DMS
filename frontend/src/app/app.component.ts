import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="auth.isLoggedIn && !isLoginRoute(); else loginView">
      <div class="app-shell" [class.is-mobile]="isMobile">
        <!-- Collapsible Sidebar / Mobile Drawer -->
        <app-sidebar [collapsed]="sidebarCollapsed" 
                     [class.mobile-open]="mobileDrawerOpen"
                     (closeDrawer)="mobileDrawerOpen = false">
        </app-sidebar>

        <!-- Overlay for mobile drawer -->
        <div class="drawer-overlay" *ngIf="isMobile && mobileDrawerOpen" (click)="mobileDrawerOpen = false"></div>

        <!-- Main Column: Header + Page Content -->
        <div class="main-container">
          <app-header [sidebarCollapsed]="sidebarCollapsed"
                       [isMobile]="isMobile"
                       (toggleSidebar)="handleSidebarToggle()">
          </app-header>

          <main class="page-area">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </ng-container>

    <ng-template #loginView>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent implements OnInit {
  sidebarCollapsed = false;
  isMobile = false;
  mobileDrawerOpen = false;

  constructor(
    public auth: AuthService, 
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.auth.refreshProfile();

    // Responsive breakpoints
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait
    ]).subscribe(result => {
      this.isMobile = result.matches;
      if (this.isMobile) {
        this.sidebarCollapsed = false; // Sidebar width handles itself in CSS is-mobile
        this.mobileDrawerOpen = false;
      }
    });

    // Close mobile drawer on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile) {
        this.mobileDrawerOpen = false;
      }
    });
  }

  handleSidebarToggle() {
    if (this.isMobile) {
      this.mobileDrawerOpen = !this.mobileDrawerOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  isLoginRoute(): boolean {
    return this.router.url.includes('/login');
  }
}
