import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="auth.isLoggedIn && !isLoginRoute(); else loginView">
      <div class="app-shell">
        <!-- Collapsible Sidebar -->
        <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>

        <!-- Main Column: Header + Page Content -->
        <div class="main-container">
          <app-header [sidebarCollapsed]="sidebarCollapsed"
                      (toggleSidebar)="sidebarCollapsed = !sidebarCollapsed">
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
export class AppComponent {
  sidebarCollapsed = false;
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.refreshProfile();
  }

  isLoginRoute(): boolean {
    return this.router.url.includes('/login');
  }
}
