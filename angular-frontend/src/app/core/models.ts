export type UserRole = 'student' | 'admin';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  role: UserRole;
  matricNumber?: string;
  phoneNumber?: string;
  department?: string;
  faculty?: string;
  level?: 'ND1' | 'ND2' | 'HND1' | 'HND2';
  gender?: 'male' | 'female';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  user?: User;
  token?: string;
  [key: string]: unknown;
}

export interface Hostel {
  _id: string;
  name: string;
  description?: string;
  location: string;
  gender: 'male' | 'female';
  totalRooms: number;
  availableRooms?: number;
  status: 'available' | 'full' | 'maintenance';
  isActive: boolean;
}

export interface Room {
  _id: string;
  hostel: Hostel | string;
  roomNumber: string;
  floor?: string;
  capacity: number;
  occupiedSpaces: number;
  status: 'available' | 'full' | 'maintenance';
  isActive: boolean;
}

export interface Application {
  _id: string;
  student: User | string;
  hostel: Hostel | string;
  preferredRoomType: 'single' | 'double' | 'triple' | 'quadruple';
  academicSession: string;
  reason?: string;
  status: ApplicationStatus;
  adminComment?: string;
  createdAt: string;
}

export interface Allocation {
  _id: string;
  student?: User | string;
  hostel: Hostel | string;
  room: Room | string;
  bedNumber: number;
  academicSession: string;
  status: 'active' | 'cancelled';
  allocatedAt?: string;
}
