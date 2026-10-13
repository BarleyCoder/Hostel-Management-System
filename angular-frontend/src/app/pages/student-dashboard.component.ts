import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, timeout } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Allocation, Application } from '../core/models';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="page-heading"><div><p class="form-kicker">STUDENT PORTAL</p><h1>Good day, {{ firstName }}</h1><p class="muted">Your accommodation information, all in one place.</p></div><span class="date-chip">{{ today | date:'EEEE, d MMMM y' }}</span></div>
    @if (error) { <div class="alert error" role="alert">{{ error }}</div> }
    @if (loading) { <div class="loading-card" role="status"><span class="spinner dark"></span> Loading your account information…</div> }
    @if (!loading) {
      <div class="stat-grid">
        <article class="stat-card"><div class="stat-icon green">▤</div><p>Applications</p><strong>{{ applications.length }}</strong><small>In your account</small></article>
        <article class="stat-card"><div class="stat-icon amber">◷</div><p>Pending review</p><strong>{{ pendingCount }}</strong><small>Awaiting decision</small></article>
        <article class="stat-card"><div class="stat-icon blue">⌂</div><p>Room allocation</p><strong class="status-word">{{ allocation ? 'Allocated' : 'Not allocated' }}</strong><small>{{ allocation ? 'Active accommodation' : 'No active allocation found' }}</small></article>
      </div>
      <div class="content-grid">
        <section class="surface-card"><div class="section-head"><div><h2>Recent applications</h2><p>Your latest accommodation requests</p></div><a routerLink="/applications">View all →</a></div>
          @if (applications.length) { <div class="table-wrap"><table><thead><tr><th>Hostel</th><th>Session</th><th>Submitted</th><th>Status</th></tr></thead><tbody>@for (app of applications.slice(0, 4); track app._id) { <tr><td><strong>{{ hostelName(app) }}</strong></td><td>{{ app.academicSession }}</td><td>{{ app.createdAt | date:'d MMM y' }}</td><td><span class="status-badge" [class]="'status-badge '+app.status">{{ app.status }}</span></td></tr> }</tbody></table></div> }
          @else { <div class="empty-state"><span>▤</span><strong>No applications yet</strong><p>Browse hostels to start an accommodation application.</p><a class="text-link" routerLink="/hostels">Explore hostels →</a></div> }
        </section>
        <section class="surface-card room-preview"><div class="section-head"><div><h2>My accommodation</h2><p>Current room allocation</p></div></div>
          @if (allocation) { <div class="room-graphic"><span>⌂</span></div><span class="status-badge active">Active allocation</span><h3>{{ hostelLabel(allocation) }}</h3><p>Room {{ roomNumber(allocation) }} · Bed {{ allocation.bedNumber }}</p><small>Academic session {{ allocation.academicSession }}</small><a class="text-link" routerLink="/my-room">View details →</a> }
          @else { <div class="empty-state compact"><span>⌂</span><strong>No room allocated</strong><p>Your allocation appears here after approval and assignment.</p></div> }
        </section>
      </div>
    }
  `,
})
export class StudentDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  loading = true;
  error = '';
  applications: Application[] = [];
  allocation: Allocation | null = null;
  readonly today = new Date();
  get pendingCount(): number { return this.applications.filter((item) => item.status === 'pending').length; }
  get firstName(): string { return this.auth.user?.fullName?.split(' ')[0] ?? 'Student'; }

  ngOnInit(): void {
    forkJoin({
      applications: this.api.myApplications().pipe(timeout(12000), catchError(() => { this.error = this.error || 'Application history is temporarily unavailable.'; return of({ success: false, applications: [] }); })),
      allocation: this.api.myAllocation().pipe(timeout(12000), catchError(() => of(null))),
    }).subscribe({
      next: (data) => { this.applications = data.applications.applications ?? []; this.allocation = data.allocation?.allocation ?? null; this.loading = false; this.cdr.markForCheck(); },
      error: (requestError: { error?: { message?: string } }) => { this.error = requestError.error?.message || 'Could not load dashboard information. Please retry.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }

  hostelName(app: Application): string { return typeof app.hostel === 'string' ? 'Hostel' : app.hostel?.name ?? 'Hostel'; }
  hostelLabel(allocation: Allocation): string { return typeof allocation.hostel === 'string' ? 'Hostel' : allocation.hostel?.name ?? 'Hostel'; }
  roomNumber(allocation: Allocation): string { return typeof allocation.room === 'string' ? '—' : allocation.room?.roomNumber ?? '—'; }
}
