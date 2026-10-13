import { Routes } from '@angular/router';
import { authenticatedGuard, guestGuard, roleGuard } from './core/auth.guards';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { PortalLayoutComponent } from './pages/portal-layout.component';
import { StudentDashboardComponent } from './pages/student-dashboard.component';
import { HostelsComponent } from './pages/hostels.component';
import { HostelDetailComponent } from './pages/hostel-detail.component';
import { ApplicationsComponent } from './pages/applications.component';
import { MyRoomComponent } from './pages/my-room.component';
import { ProfileComponent } from './pages/profile.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: 'login', component: LoginComponent, canActivate: [guestGuard] },
	{ path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
	{
		path: '',
		component: PortalLayoutComponent,
		canActivate: [authenticatedGuard],
		children: [
			{ path: 'dashboard', component: StudentDashboardComponent, canActivate: [roleGuard('student')] },
			{ path: 'hostels', component: HostelsComponent, canActivate: [roleGuard('student')] },
			{ path: 'hostels/:id', component: HostelDetailComponent, canActivate: [roleGuard('student')] },
			{ path: 'applications', component: ApplicationsComponent, canActivate: [roleGuard('student')] },
			{ path: 'my-room', component: MyRoomComponent, canActivate: [roleGuard('student')] },
			{ path: 'profile', component: ProfileComponent, canActivate: [roleGuard('student')] },
			{ path: 'admin', component: AdminDashboardComponent, canActivate: [roleGuard('admin')] },
		],
	},
	{ path: '**', redirectTo: 'login' },
];
