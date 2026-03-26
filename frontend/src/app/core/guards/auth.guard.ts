import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleHome(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':     return '/super-admin';
    case 'ADMIN':           return '/dashboard';
    case 'SALES_MANAGER':   return '/dashboard';
    case 'SALES_EXECUTIVE': return '/dashboard';
    case 'SERVICE_ADVISOR': return '/service';
    case 'MECHANIC':        return '/service';
    case 'INVENTORY_MANAGER': return '/inventory';
    case 'ACCOUNTS':        return '/finance';
    default:                return '/dashboard';
  }
}

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
    const requiredPermission: string = route.data['permission'] ?? null;
    const role = (this.auth.role ?? '').replace('ROLE_', '');

    // Allow if user has the specific permission (Dynamic)
    if (requiredPermission && this.auth.hasPermission(requiredPermission)) return true;

    // Allow if user has one of the allowed roles (Fallback/Hardcoded)
    if (allowedRoles.length > 0 && allowedRoles.includes(role)) return true;

    // Default: Allow if no restrictions specified (should theoretically not happen with guards applied)
    if (allowedRoles.length === 0 && !requiredPermission) return true;

    this.router.navigate([roleHome(role)]);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (!this.auth.isLoggedIn) return true;
    const role = (this.auth.role ?? '').replace('ROLE_', '');
    this.router.navigate([roleHome(role)]);
    return false;
  }
}
