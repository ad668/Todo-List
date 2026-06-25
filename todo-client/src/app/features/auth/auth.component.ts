import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="brand-panel">
          <h1>TaskFlow</h1>
          <p>Organize work, track progress, and collaborate with confidence.</p>
          <div class="pill">Role-based access</div>
          <div class="pill">Realtime task tracking</div>
        </div>

        <div class="form-panel">
          <div class="toggle-row">
            <button type="button" [class.active]="isLogin" (click)="switchMode(true)">Login</button>
            <button type="button" [class.active]="!isLogin" (click)="switchMode(false)">Register</button>
          </div>

          <h2>{{ isLogin ? 'Welcome back' : 'Create account' }}</h2>
          <p class="subtext">{{ isLogin ? 'Sign in to continue your workspace.' : 'Register to start managing tasks.' }}</p>

          <div *ngIf="!isLogin" class="field-group">
            <input [(ngModel)]="registerUsername" placeholder="Username" />
            <input [(ngModel)]="registerEmail" placeholder="Email" />
          </div>

          <input [(ngModel)]="usernameOrEmail" [placeholder]="isLogin ? 'Username or Email' : 'Username'" />
          <input [(ngModel)]="password" type="password" [placeholder]="isLogin ? 'Password' : 'Password'" />
          <input *ngIf="!isLogin" [(ngModel)]="confirmPassword" type="password" placeholder="Confirm Password" />

          <button class="submit-btn" (click)="isLogin ? login() : register()">{{ isLogin ? 'Login' : 'Register' }}</button>
          <p class="hint">Admin demo: admin / Admin&#64;123</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `:host{display:block;min-height:100vh;background:linear-gradient(135deg,#2563eb 0%,#14b8a6 100%);padding:24px;}` ,
    `.auth-shell{display:grid;place-items:center;min-height:100%;}` ,
    `.auth-card{display:grid;grid-template-columns:1.1fr 1fr;background:white;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,.25);max-width:980px;width:100%;}` ,
    `.brand-panel{padding:36px 32px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:white;display:flex;flex-direction:column;justify-content:center;gap:14px;}` ,
    `.brand-panel h1{margin:0;font-size:2rem;}` ,
    `.brand-panel p{margin:0;line-height:1.6;opacity:.9;}` ,
    `.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.16);width:max-content;font-size:.9rem;}` ,
    `.form-panel{padding:36px 32px;display:grid;gap:12px;align-content:center;}` ,
    `.toggle-row{display:flex;gap:8px;margin-bottom:6px;}` ,
    `.toggle-row button{flex:1;padding:10px 12px;border:none;border-radius:999px;background:#e2e8f0;color:#334155;font-weight:700;cursor:pointer;}` ,
    `.toggle-row button.active{background:#2563eb;color:white;}` ,
    `h2{margin:0;font-size:1.6rem;color:#0f172a;}` ,
    `.subtext{margin:0 0 8px;color:#64748b;}` ,
    `.field-group{display:grid;gap:12px;}` ,
    `input{padding:12px 14px;border:1px solid #cbd5e1;border-radius:12px;font-size:1rem;}` ,
    `.submit-btn{padding:12px 14px;border:none;border-radius:12px;background:#14b8a6;color:white;font-weight:700;cursor:pointer;}` ,
    `.hint{font-size:.9rem;color:#64748b;margin:0;}` ,
    `@media (max-width: 780px){.auth-card{grid-template-columns:1fr;}.brand-panel{padding-bottom:20px;}}`
  ]
})
export class AuthComponent {
  isLogin = true;
  usernameOrEmail = '';
  password = '';
  registerUsername = '';
  registerEmail = '';
  confirmPassword = '';

  constructor(private taskService: TaskService, private router: Router) {}

  switchMode(mode: boolean) {
    this.isLogin = mode;
  }

  login() {
    this.taskService.login({ usernameOrEmail: this.usernameOrEmail, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => alert('Login failed')
    });
  }

  register() {
    this.taskService.register({
      username: this.registerUsername,
      email: this.registerEmail,
      password: this.password,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => alert('Registration failed')
    });
  }
}
