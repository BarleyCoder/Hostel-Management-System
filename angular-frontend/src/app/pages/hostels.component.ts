import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Hostel } from '../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hostels',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-heading"><div><p class="form-kicker">ACCOMMODATION</p><h1>Explore hostels</h1><p class="muted">Browse accommodation options available at your institution.</p></div><a class="button-link" routerLink="/applications">My applications →</a></div>
    @if (error) { <div class="alert error" role="alert">{{ error }}</div> }
    @if (loading) { <div class="loading-card" role="status"><span class="spinner dark"></span> Loading hostels from the accommodation service…</div> }
    @if (!loading && !hostels.length) { <div class="surface-card empty-state"><span>⌂</span><strong>No hostels are currently listed</strong><p>Please check back later or contact your accommodation office.</p></div> }
    @if (!loading && hostels.length) { <div class="hostel-grid">@for (hostel of hostels; track hostel._id) {
      <article class="hostel-card"><div class="hostel-art"><span class="hostel-symbol">⌂</span><span class="status-badge" [class]="'status-badge '+hostel.status">{{ hostel.status }}</span></div><div class="hostel-body"><div class="hostel-meta"><span>{{ hostel.gender }} accommodation</span><span>·</span><span>{{ hostel.location }}</span></div><h2>{{ hostel.name }}</h2><p>{{ hostel.description || 'Accommodation managed by your institution.' }}</p><div class="hostel-foot"><span>{{ hostel.availableRooms ?? '—' }} available rooms <small>of {{ hostel.totalRooms }}</small></span><a [routerLink]="['/hostels', hostel._id]">Details</a><a [routerLink]="'/applications'" [queryParams]="{ hostel: hostel._id }">Apply →</a></div></div></article>
    }</div> }
  `,
})
export class HostelsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  hostels: Hostel[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.hostels().subscribe({
      next: (response) => { this.hostels = (response.hostels ?? []).filter((hostel) => hostel.isActive); this.loading = false; this.cdr.markForCheck(); },
      error: (requestError: { error?: { message?: string } }) => { this.error = requestError.error?.message || 'Could not load hostels. Check the API connection and retry.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }
}
