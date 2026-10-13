import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="login-page min-h-screen bg-stone-50">
      <section class="login-art" aria-label="Campus accommodation portal">
        <div class="art-content">
          <div class="brand-mark" aria-hidden="true">C</div>
          <span class="eyebrow">CAMPUSSTAY · STUDENT ACCOMMODATION</span>
          <h1>A place to<br><em>belong.</em></h1>
          <p>Simple, transparent hostel applications for your campus journey.</p>
          <div class="art-foot"><span>Secure student portal</span><span>01 / 03</span></div>
        </div>
        <div class="art-orb orb-one"></div><div class="art-orb orb-two"></div>
      </section>
      <section class="login-panel">
        <div class="login-card">
          <div class="mobile-brand"><span class="brand-mark small">C</span><span>CampusStay</span></div>
          <p class="form-kicker">WELCOME BACK</p>
          <h2>Sign in to your account</h2>
          <p class="form-subtitle">Use your registered student or administrator email.</p>
          @if (expired) { <div class="alert warning" role="status">Your session expired. Please sign in again.</div> }
          @if (error) { <div class="alert error" role="alert">{{ error }}</div> }
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <label for="email">Email address</label>
            <input id="email" type="email" formControlName="email" autocomplete="username" placeholder="you@institution.edu" [attr.aria-invalid]="form.controls.email.invalid && form.controls.email.touched" />
            @if (form.controls.email.touched && form.controls.email.invalid) { <small class="field-error">Enter a valid email address.</small> }
            <div class="password-label"><label for="password">Password</label></div>
            <input id="password" type="password" formControlName="password" autocomplete="current-password" placeholder="Enter your password" />
            @if (form.controls.password.touched && form.controls.password.invalid) { <small class="field-error">Password is required.</small> }
            <button class="primary-button" type="submit" [disabled]="loading">
              @if (loading) { <span class="spinner" aria-hidden="true"></span> Signing in… } @else { Sign in <span aria-hidden="true">→</span> }
            </button>
          </form>
          <p class="register-prompt">New student? <a routerLink="/register">Create an account</a></p>
          <div class="secure-note"><span aria-hidden="true">◈</span> Your information is protected and kept private.</div>
        </div>
        <footer class="panel-footer">© 2026 CampusStay <span>·</span> Accommodation made clear.</footer>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly expired = this.route.snapshot.queryParamMap.has('expired');
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error = '';
    this.loading = true;
    this.auth.login(this.form.getRawValue()).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({
      next: (user) => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const defaultRoute = user.role === 'admin' ? '/admin' : '/dashboard';
        void this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : defaultRoute);
      },
      error: (requestError: { error?: { message?: string }; message?: string }) => {
        this.error = requestError.error?.message || requestError.message || 'Unable to reach the server. Check that the API is running and try again.';
        this.cdr.markForCheck();
      },
    });
  }
}
