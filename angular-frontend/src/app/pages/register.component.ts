import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-simple-page min-h-screen bg-stone-50">
      <a class="back-link" routerLink="/login">← Back to sign in</a>
      <section class="auth-simple-card">
        <div class="brand-mark small">C</div>
        <p class="form-kicker">STUDENT REGISTRATION</p>
        <h1>Create your account</h1>
        <p class="form-subtitle">Register with your institution details to apply for accommodation.</p>
        @if (error) { <div class="alert error" role="alert">{{ error }}</div> }
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label for="fullName">Full name</label><input id="fullName" formControlName="fullName" autocomplete="name" placeholder="Your full name" />
          <label for="email">Email address</label><input id="email" type="email" formControlName="email" autocomplete="email" placeholder="you@institution.edu" />
          <label for="matricNumber">Matric number <span class="optional">Optional</span></label><input id="matricNumber" formControlName="matricNumber" placeholder="e.g. ND/2026/001" />
          <label for="phoneNumber">Phone number <span class="optional">Optional</span></label><input id="phoneNumber" type="tel" formControlName="phoneNumber" autocomplete="tel" placeholder="Your contact number" />
          <label for="department">Department <span class="optional">Optional</span></label><input id="department" formControlName="department" placeholder="Your department" />
          <label for="faculty">Faculty <span class="optional">Optional</span></label><input id="faculty" formControlName="faculty" placeholder="Your faculty" />
          <label for="level">Level <span class="optional">Optional</span></label><select id="level" formControlName="level"><option value="">Select level</option><option value="ND1">ND1</option><option value="ND2">ND2</option><option value="HND1">HND1</option><option value="HND2">HND2</option></select>
          <label for="gender">Gender <span class="optional">Optional</span></label><select id="gender" formControlName="gender"><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option></select>
          <label for="password">Password</label><input id="password" type="password" formControlName="password" autocomplete="new-password" placeholder="At least 6 characters" />
          <button class="primary-button" type="submit" [disabled]="loading">{{ loading ? 'Creating account…' : 'Create student account →' }}</button>
        </form>
        <p class="register-prompt">Already registered? <a routerLink="/login">Sign in</a></p>
      </section>
    </main>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    matricNumber: [''],
    phoneNumber: [''],
    department: [''],
    faculty: [''],
    level: [''],
    gender: [''],
  });
  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please complete the required fields. Passwords must be at least 6 characters.';
      return;
    }
    const formValue = this.form.getRawValue();
    const body: Record<string, string> = {
      fullName: formValue.fullName.trim(),
      email: formValue.email.trim(),
      password: formValue.password,
    };
    if (formValue.matricNumber.trim()) body['matricNumber'] = formValue.matricNumber.trim();
    if (formValue.phoneNumber.trim()) body['phoneNumber'] = formValue.phoneNumber.trim();
    if (formValue.department.trim()) body['department'] = formValue.department.trim();
    if (formValue.faculty.trim()) body['faculty'] = formValue.faculty.trim();
    if (formValue.level) body['level'] = formValue.level;
    if (formValue.gender) body['gender'] = formValue.gender;
    this.error = '';
    this.loading = true;
    this.auth.register(body).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (requestError: { error?: { message?: string }; message?: string }) => {
        this.error = requestError.error?.message || requestError.message || 'Unable to reach the server. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }
}
