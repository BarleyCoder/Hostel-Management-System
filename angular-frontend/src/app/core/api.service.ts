import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Allocation, Application, Hostel, Room } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  hostels(): Observable<{ success: boolean; hostels: Hostel[] }> {
    return this.http.get<{ success: boolean; hostels: Hostel[] }>(`${this.baseUrl}/hostels`);
  }

  hostel(id: string): Observable<{ success: boolean; hostel: Hostel }> {
    return this.http.get<{ success: boolean; hostel: Hostel }>(`${this.baseUrl}/hostels/${id}`);
  }

  roomsByHostel(id: string): Observable<{ success: boolean; rooms: Room[] }> {
    return this.http.get<{ success: boolean; rooms: Room[] }>(`${this.baseUrl}/rooms/hostel/${id}`);
  }

  rooms(): Observable<{ success: boolean; rooms: Room[] }> {
    return this.http.get<{ success: boolean; rooms: Room[] }>(`${this.baseUrl}/rooms`);
  }

  myApplications(): Observable<{ success: boolean; applications: Application[] }> {
    return this.http.get<{ success: boolean; applications: Application[] }>(`${this.baseUrl}/applications/my`);
  }

  submitApplication(application: {
    hostel: string;
    preferredRoomType: string;
    academicSession: string;
    reason: string;
  }): Observable<{ success: boolean; message: string; application: Application }> {
    return this.http.post<{ success: boolean; message: string; application: Application }>(`${this.baseUrl}/applications`, application);
  }

  cancelApplication(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.baseUrl}/applications/${id}/cancel`, {});
  }

  myAllocation(): Observable<{ success: boolean; allocation: Allocation }> {
    return this.http.get<{ success: boolean; allocation: Allocation }>(`${this.baseUrl}/allocations/my`);
  }

  createHostel(hostel: Partial<Hostel>): Observable<{ success: boolean; message: string; hostel: Hostel }> {
    return this.http.post<{ success: boolean; message: string; hostel: Hostel }>(`${this.baseUrl}/hostels`, hostel);
  }

  updateHostel(id: string, hostel: Partial<Hostel>): Observable<{ success: boolean; message: string; hostel: Hostel }> {
    return this.http.put<{ success: boolean; message: string; hostel: Hostel }>(`${this.baseUrl}/hostels/${id}`, hostel);
  }

  deleteHostel(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/hostels/${id}`);
  }

  createRoom(room: { hostel: string; roomNumber: string; floor?: string; capacity: number }): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.post<{ success: boolean; message: string; room: Room }>(`${this.baseUrl}/rooms`, room);
  }

  updateRoom(id: string, room: Partial<Room>): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.put<{ success: boolean; message: string; room: Room }>(`${this.baseUrl}/rooms/${id}`, room);
  }

  deleteRoom(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/rooms/${id}`);
  }

  applications(): Observable<{ success: boolean; applications: Application[] }> {
    return this.http.get<{ success: boolean; applications: Application[] }>(`${this.baseUrl}/applications`);
  }

  reviewApplication(id: string, status: 'approved' | 'rejected', adminComment: string): Observable<{ success: boolean; message: string; application: Application }> {
    return this.http.put<{ success: boolean; message: string; application: Application }>(`${this.baseUrl}/applications/${id}/review`, { status, adminComment });
  }

  allocations(): Observable<{ success: boolean; allocations: Allocation[] }> {
    return this.http.get<{ success: boolean; allocations: Allocation[] }>(`${this.baseUrl}/allocations`);
  }

  createAllocation(applicationId: string, roomId: string, bedNumber: number): Observable<{ success: boolean; message: string; allocation: Allocation }> {
    return this.http.post<{ success: boolean; message: string; allocation: Allocation }>(`${this.baseUrl}/allocations`, { applicationId, roomId, bedNumber });
  }

  cancelAllocation(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.baseUrl}/allocations/${id}/cancel`, {});
  }
}
