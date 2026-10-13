import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './models';

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly tokenKey = 'hostel_token';
  private readonly userKey = 'hostel_user';
  private currentUser: User | null = this.readStoredUser();
  private validated = false;

  get user(): User | null {
    return this.currentUser;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      switchMap((response) => {
        const user = this.acceptAuthResponse(response);
        return this.restoreSession().pipe(catchError(() => of(user)));
      }),
    );
  }

  register(details: Record<string, string>): Observable<User> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, details).pipe(
      switchMap((response) => {
        const user = this.acceptAuthResponse(response);
        return this.restoreSession().pipe(catchError(() => of(user)));
      }),
    );
  }

  restoreSession(): Observable<User> {
    return this.http.get<{ success: boolean; user: User }>(`${this.baseUrl}/auth/me`).pipe(
      map((response) => {
        if (!response?.success || !response.user) {
          throw new Error('The server returned an invalid account response.');
        }
        return response.user;
      }),
      tap((user) => {
        this.currentUser = user;
        this.validated = true;
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser = null;
    this.validated = false;
  }

  clearInvalidSession(): void {
    this.logout();
  }

  private acceptAuthResponse(response: AuthResponse): User {
    if (!response?.success || !response.token || !response.user?.role) {
      throw new Error('The server returned an incomplete login response.');
    }
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUser = response.user;
    this.validated = false;
    return response.user;
  }

  get hasValidatedSession(): boolean {
    return this.validated;
  }

  private readStoredUser(): User | null {
    try {
      const value = localStorage.getItem(this.userKey);
      return value ? (JSON.parse(value) as User) : null;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
