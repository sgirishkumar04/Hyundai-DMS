import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.isLoggedIn) return true;
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles: string[] = route.data['roles'] ?? [];
    if (allowedRoles.length === 0 || allowedRoles.includes(this.auth.role)) return true;
    this.router.navigate(['/dashboard']);
    return false;
  }
}
