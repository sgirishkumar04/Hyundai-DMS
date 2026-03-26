import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'hd_dms_token';
  private readonly USER_KEY  = 'hd_dms_user';
  private userSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        this.userSubject.next(res);
      }));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshProfile(): void {
    if (!this.isLoggedIn) return;
    this.http.get<any>(`${environment.apiUrl}/employees/me`).subscribe({
      next: (emp) => {
        const currentRes = this.getStoredUser();
        if (currentRes) {
          currentRes.fullName = emp.firstName + ' ' + emp.lastName;
          if (emp.role && emp.role.permissions) {
            currentRes.permissions = emp.role.permissions.map((p: any) => p.name);
          }
          localStorage.setItem(this.USER_KEY, JSON.stringify(currentRes));
          this.userSubject.next(currentRes);
        }
      },
      error: () => {}
    });
  }

  get token(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  get currentUser(): AuthResponse | null { return this.userSubject.value; }
  get role(): string { return this.currentUser?.role ?? ''; }
  get isLoggedIn(): boolean { return !!this.token; }
  get isSuperAdmin(): boolean { return this.currentUser?.isSuperAdmin === true; }
  get dealerId(): number | null { return this.currentUser?.dealerId ?? null; }

  get permissions(): string[] {
    const user = this.currentUser;
    if (user && user.permissions) return user.permissions;

    const t = this.token;
    if (!t) return [];
    try {
      // Decode Base64Url JWT Payload
      const payloadBase64 = t.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decodedJson);
      return payload.permissions || [];
    } catch (e) {
      return [];
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  private getStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
