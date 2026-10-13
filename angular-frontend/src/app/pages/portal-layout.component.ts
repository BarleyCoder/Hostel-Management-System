import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="portal-frame min-h-screen bg-stone-50">
      <aside class="sidebar">
        <a class="side-brand" [routerLink]="isAdmin ? '/admin' : '/dashboard'"><span class="brand-mark small">C</span><span>CampusStay<small>ACCOMMODATION PORTAL</small></span></a>
        <div class="nav-section">WORKSPACE</div>
        @if (isAdmin) {
          <a class="side-link" routerLink="/admin" routerLinkActive="active"><span>▦</span> Admin overview</a>
        } @else {
          <a class="side-link" routerLink="/dashboard" routerLinkActive="active"><span>▦</span> Dashboard</a>
          <a class="side-link" routerLink="/hostels" routerLinkActive="active"><span>⌂</span> Explore hostels</a>
          <a class="side-link" routerLink="/applications" routerLinkActive="active"><span>▤</span> Applications</a>
          <a class="side-link" routerLink="/my-room" routerLinkActive="active"><span>▧</span> My room</a>
          <a class="side-link" routerLink="/profile" routerLinkActive="active"><span>♙</span> My profile</a>
        }
        <div class="sidebar-spacer"></div>
        <div class="support-card"><span class="support-icon">?</span><strong>Need assistance?</strong><p>Contact your institution's accommodation office for support.</p></div>
        <button class="side-logout" type="button" (click)="logout()"><span>↪</span> Sign out</button>
      </aside>
      <main class="portal-main">
        <header class="topbar"><div class="breadcrumb">Student services <span>/</span> {{ isAdmin ? 'Administration' : 'Accommodation' }}</div><div class="top-user"><div class="user-avatar">{{ initials }}</div><div><strong>{{ auth.user?.fullName }}</strong><small>{{ isAdmin ? 'Administrator' : 'Student' }}</small></div></div></header>
        <section class="page-content"><router-outlet /></section>
      </main>
    </div>
  `,
})
export class PortalLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  get isAdmin(): boolean { return this.auth.user?.role === 'admin'; }
  get initials(): string { return this.auth.user?.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? 'U'; }
  logout(): void { this.auth.logout(); void this.router.navigate(['/login']); }
}
