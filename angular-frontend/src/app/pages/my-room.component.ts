import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Allocation, Hostel, Room } from '../core/models';

@Component({
  selector: 'app-my-room',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-heading"><div><p class="form-kicker">ACCOMMODATION</p><h1>My room</h1><p class="muted">Your current assigned hostel, room, and bed details.</p></div></div>
    @if (error) { <div class="alert error" role="alert">{{ error }}</div> }
    @if (loading) { <div class="loading-card" role="status"><span class="spinner dark"></span> Checking your allocation…</div> }
    @if (!loading && !allocation && !error) { <section class="surface-card empty-state"><span>⌂</span><strong>No active room allocation</strong><p>If your application has been approved, check again after the accommodation office assigns a room.</p></section> }
    @if (allocation) { <section class="surface-card room-detail"><div class="room-banner"><div><span class="status-badge active">{{ allocation.status }}</span><h2>{{ hostelName }}</h2><p>{{ location }}</p></div><div class="large-room-symbol">⌂</div></div><div class="room-facts"><div><small>ROOM</small><strong>{{ roomNumber }}</strong></div><div><small>BED</small><strong>{{ allocation.bedNumber }}</strong></div><div><small>ACADEMIC SESSION</small><strong>{{ allocation.academicSession }}</strong></div><div><small>ROOM OCCUPANCY</small><strong>{{ occupancy }}</strong></div><div><small>FLOOR</small><strong>{{ floor }}</strong></div><div><small>ALLOCATED</small><strong>{{ allocation.allocatedAt | date:'d MMM y' }}</strong></div></div><p class="muted room-help">For room changes or accommodation support, contact your institution's accommodation office.</p></section> }
  `,
})
export class MyRoomComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  loading = true;
  error = '';
  allocation: Allocation | null = null;

  get hostelName(): string { const hostel = this.allocation?.hostel; return hostel && typeof hostel !== 'string' ? hostel.name : 'Hostel'; }
  get location(): string { const hostel = this.allocation?.hostel; return hostel && typeof hostel !== 'string' ? hostel.location : 'Accommodation details'; }
  get roomNumber(): string { const room = this.allocation?.room; return room && typeof room !== 'string' ? room.roomNumber : '—'; }
  get floor(): string { const room = this.allocation?.room; return room && typeof room !== 'string' ? room.floor || 'Not specified' : '—'; }
  get occupancy(): string { const room = this.allocation?.room; return room && typeof room !== 'string' ? `${room.occupiedSpaces} / ${room.capacity}` : '—'; }

  ngOnInit(): void {
    this.api.myAllocation().subscribe({
      next: (response) => { this.allocation = response.allocation; this.loading = false; this.cdr.markForCheck(); },
      error: (requestError: { status?: number; error?: { message?: string } }) => {
        if (requestError.status !== 404) this.error = requestError.error?.message || 'Could not load allocation details.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
