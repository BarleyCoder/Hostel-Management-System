import { Component, inject } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="page-heading"><div><p class="form-kicker">ACCOUNT</p><h1>My profile</h1><p class="muted">Personal and academic details associated with your account.</p></div></div>
    <section class="surface-card profile-card"><div class="profile-intro"><div class="profile-avatar">{{ initials }}</div><div><h2>{{ auth.user?.fullName }}</h2><p>{{ auth.user?.email }}</p></div></div><div class="profile-grid"><div><small>FULL NAME</small><strong>{{ auth.user?.fullName }}</strong></div><div><small>EMAIL ADDRESS</small><strong>{{ auth.user?.email }}</strong></div><div><small>ROLE</small><strong>{{ auth.user?.role }}</strong></div><div><small>MATRIC NUMBER</small><strong>{{ auth.user?.matricNumber || 'Not provided' }}</strong></div><div><small>PHONE NUMBER</small><strong>{{ auth.user?.phoneNumber || 'Not provided' }}</strong></div><div><small>DEPARTMENT</small><strong>{{ auth.user?.department || 'Not provided' }}</strong></div><div><small>FACULTY</small><strong>{{ auth.user?.faculty || 'Not provided' }}</strong></div><div><small>LEVEL</small><strong>{{ auth.user?.level || 'Not provided' }}</strong></div><div><small>GENDER</small><strong>{{ auth.user?.gender || 'Not provided' }}</strong></div></div><div class="info-note">Profile editing is not available: the existing backend currently implements only <code>GET /api/auth/me</code>, with no profile-update endpoint. Your information is shown read-only.</div></section>
  `,
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  get initials(): string { return this.auth.user?.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() ?? 'U'; }
}
