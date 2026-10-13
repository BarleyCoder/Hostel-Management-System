import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Application, Hostel } from '../core/models';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <div class="page-heading"><div><p class="form-kicker">STUDENT SERVICES</p><h1>Accommodation applications</h1><p class="muted">Submit a request and follow its review status here.</p></div></div>
    @if (notice) { <div class="alert success" role="status">{{ notice }}</div> } @if (error) { <div class="alert error" role="alert">{{ error }}</div> }
    <div class="content-grid application-layout">
      <section class="surface-card"><div class="section-head"><div><h2>New application</h2><p>Your student identity is taken from your signed-in account.</p></div></div>
        @if (hostelsLoading) { <p class="muted">Loading available hostels…</p> }
        @if (!hostelsLoading && !hostels.length) { <div class="empty-inline">No active hostels are available for applications at the moment.</div> }
        <form [formGroup]="form" (ngSubmit)="submit()" class="stack-form" novalidate>
          <label for="hostel">Preferred hostel</label><select id="hostel" formControlName="hostel"><option value="">Choose a hostel</option>@for (hostel of hostels; track hostel._id) { <option [value]="hostel._id">{{ hostel.name }} · {{ hostel.gender }} · {{ hostel.location }}</option> }</select>
          <label for="academicSession">Academic session</label><input id="academicSession" formControlName="academicSession" placeholder="Enter your session, e.g. 2026/2027" />
          <label for="preferredRoomType">Preferred room type</label><select id="preferredRoomType" formControlName="preferredRoomType"><option value="quadruple">Quadruple</option><option value="triple">Triple</option><option value="double">Double</option><option value="single">Single</option></select>
          <label for="reason">Reason for application <span class="optional">Optional</span></label><textarea id="reason" rows="3" maxlength="500" formControlName="reason" placeholder="Share any relevant information (max 500 characters)"></textarea>
          <button class="primary-button" type="submit" [disabled]="submitting || hostelsLoading || !hostels.length">{{ submitting ? 'Submitting…' : 'Submit application →' }}</button>
          <small class="muted">The API permits one pending or approved application per session; please check your history before submitting.</small>
        </form>
      </section>
      <section class="surface-card"><div class="section-head"><div><h2>Application history</h2><p>Live status from your student account</p></div><button class="quiet-button" type="button" (click)="loadApplications()">↻ Refresh</button></div>
        @if (applicationsLoading) { <div class="loading-card small" role="status">Loading applications…</div> }
        @else if (!applications.length) { <div class="empty-state compact"><span>▤</span><strong>No application history</strong><p>Your submitted applications will appear here.</p></div> }
        @else { <div class="application-list">@for (application of applications; track application._id) { <article class="application-item"><div class="application-top"><div><strong>{{ hostelName(application) }}</strong><small>{{ application.academicSession }} · {{ application.createdAt | date:'d MMM y' }}</small></div><span class="status-badge" [class]="'status-badge '+application.status">{{ application.status }}</span></div>@if (application.adminComment) { <p class="admin-note"><strong>Administrator note:</strong> {{ application.adminComment }}</p> }@if (application.status === 'pending') { <button class="danger-text" type="button" (click)="cancel(application)">Cancel request</button> }</article> }</div> }
      </section>
    </div>
  `,
})
export class ApplicationsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly form = this.fb.nonNullable.group({
    hostel: ['', Validators.required],
    academicSession: ['', Validators.required],
    preferredRoomType: ['quadruple', Validators.required],
    reason: ['', Validators.maxLength(500)],
  });
  hostels: Hostel[] = [];
  applications: Application[] = [];
  hostelsLoading = true;
  applicationsLoading = true;
  submitting = false;
  error = '';
  notice = '';

  ngOnInit(): void {
    this.api.hostels().subscribe({
      next: (response) => {
        this.hostels = (response.hostels ?? []).filter((hostel) => hostel.isActive);
        const chosen = this.route.snapshot.queryParamMap.get('hostel');
        if (chosen && this.hostels.some((hostel) => hostel._id === chosen)) this.form.controls.hostel.setValue(chosen);
        this.hostelsLoading = false;
        this.cdr.markForCheck();
      },
      error: (requestError: { error?: { message?: string } }) => { this.error = requestError.error?.message || 'Could not load hostel choices.'; this.hostelsLoading = false; this.cdr.markForCheck(); },
    });
    this.loadApplications();
  }

  loadApplications(): void {
    this.applicationsLoading = true;
    this.api.myApplications().subscribe({
      next: (response) => { this.applications = response.applications ?? []; this.applicationsLoading = false; this.cdr.markForCheck(); },
      error: (requestError: { error?: { message?: string } }) => { this.error = requestError.error?.message || 'Could not load application history.'; this.applicationsLoading = false; this.cdr.markForCheck(); },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error = 'Select a hostel and enter the academic session.'; return; }
    this.error = ''; this.notice = ''; this.submitting = true;
    this.api.submitApplication(this.form.getRawValue()).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); })).subscribe({
      next: (response) => { this.notice = response.message || 'Application submitted.'; this.loadApplications(); this.cdr.markForCheck(); },
      error: (requestError: { error?: { message?: string } }) => { this.error = requestError.error?.message || 'Application could not be submitted.'; this.cdr.markForCheck(); },
    });
  }

  cancel(application: Application): void {
    if (!window.confirm('Cancel this pending application?')) return;
    this.error = ''; this.notice = '';
    this.api.cancelApplication(application._id).subscribe({
      next: (response) => { this.notice = response.message; this.loadApplications(); this.cdr.markForCheck(); },
      error: (requestError: { error?: { message?: string } }) => { this.error = requestError.error?.message || 'Could not cancel this application.'; this.cdr.markForCheck(); },
    });
  }

  hostelName(application: Application): string { return typeof application.hostel === 'string' ? 'Hostel' : application.hostel?.name ?? 'Hostel'; }
}
