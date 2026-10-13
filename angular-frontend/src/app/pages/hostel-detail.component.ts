import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Hostel, Room } from '../core/models';

@Component({
  selector: 'app-hostel-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="detail-back" routerLink="/hostels">← All hostels</a>
    @if (loading) { <div class="loading-card" role="status">Loading hostel details…</div> }
    @if (error) { <div class="alert error" role="alert">{{ error }}</div> }
    @if (!loading && hostel) {
      <div class="page-heading"><div><p class="form-kicker">HOSTEL DETAILS</p><h1>{{ hostel.name }}</h1><p class="muted">{{ hostel.location }} · {{ hostel.gender }} accommodation</p></div><a class="button-link" [routerLink]="'/applications'" [queryParams]="{ hostel: hostel._id }">Apply to this hostel →</a></div>
      <section class="surface-card detail-summary"><div class="large-room-symbol">⌂</div><div><span class="status-badge" [class]="'status-badge '+hostel.status">{{ hostel.status }}</span><p>{{ hostel.description || 'Accommodation managed by your institution.' }}</p><div class="detail-stats"><span><strong>{{ hostel.totalRooms }}</strong> total rooms</span><span><strong>{{ hostel.availableRooms ?? '—' }}</strong> available rooms</span></div></div></section>
      <section class="surface-card detail-rooms"><div class="section-head"><div><h2>Room availability</h2><p>Room status and capacity returned by the backend</p></div></div>
        @if (!rooms.length) { <div class="empty-state compact"><strong>No room details available</strong><p>Contact the accommodation office for availability information.</p></div> }
        @else { <div class="room-cards">@for(room of rooms;track room._id){<article class="room-card"><div><strong>Room {{ room.roomNumber }}</strong><small>{{ room.floor || 'Floor not specified' }}</small></div><span class="status-badge" [class]="'status-badge '+room.status">{{ room.status }}</span><p>{{ room.occupiedSpaces }} of {{ room.capacity }} beds occupied</p><div class="capacity-track"><span [style.width.%]="room.capacity ? room.occupiedSpaces / room.capacity * 100 : 0"></span></div></article>}</div> }
      </section>
    }
  `,
})
export class HostelDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  hostel: Hostel | null = null;
  rooms: Room[] = [];
  loading = true;
  error = '';
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'A hostel identifier is required.'; this.loading = false; return; }
    forkJoin({ hostel: this.api.hostel(id), rooms: this.api.roomsByHostel(id) }).subscribe({
      next: (response) => { this.hostel = response.hostel.hostel; this.rooms = response.rooms.rooms ?? []; this.loading = false; this.cdr.markForCheck(); },
      error: (requestError: { error?: { message?: string } }) => { this.error = requestError.error?.message || 'Could not load details for this hostel.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }
}
