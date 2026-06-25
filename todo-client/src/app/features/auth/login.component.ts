import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="brand-panel">
          <h1>TaskFlow</h1>
          <p>Organize work and keep every task moving with clarity.</p>
          <div class="pill">Role-based access</div>
          <div class="pill">Task insights</div>
        </div>

        <div class="form-panel">
          <h2>Welcome back</h2>
          <p class="subtext">Sign in to continue your workspace.</p>

          <input [(ngModel)]="usernameOrEmail" placeholder="Username or Email" />
          <input [(ngModel)]="password" type="password" placeholder="Password" />

          <button class="submit-btn" (click)="login()">Login</button>
          <p class="link-row">
            Don’t have an account? <a routerLink="/register">Create one</a>
          </p>
          <!-- <p class="hint">Admin demo: admin / Admin&#64;123</p> -->
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
    `h2{margin:0;font-size:1.6rem;color:#0f172a;}` ,
    `.subtext{margin:0 0 8px;color:#64748b;}` ,
    `input{padding:12px 14px;border:1px solid #cbd5e1;border-radius:12px;font-size:1rem;}` ,
    `.submit-btn{padding:12px 14px;border:none;border-radius:12px;background:#14b8a6;color:white;font-weight:700;cursor:pointer;}` ,
    `.link-row{font-size:.95rem;color:#64748b;}` ,
    `.link-row a{color:#2563eb;text-decoration:none;font-weight:700;}` ,
    `.hint{font-size:.9rem;color:#64748b;margin:0;}` ,
    `@media (max-width: 780px){.auth-card{grid-template-columns:1fr;}.brand-panel{padding-bottom:20px;}}`
  ]
})
export class LoginComponent {
  usernameOrEmail = '';
  password = '';

  constructor(private taskService: TaskService, private router: Router) {}

  login() {
    this.taskService.login({ usernameOrEmail: this.usernameOrEmail, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => alert('Login failed')
    });
  }
}
