import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <div class="topbar">
        <button class="back-btn" type="button" (click)="backToDashboard()">Back to dashboard</button>
        <button class="logout-btn" type="button" (click)="logout()">Logout</button>
      </div>

      <section class="hero-card">
        <div>
          <p class="eyebrow">Task board</p>
          <h2>Create a new task</h2>
          <p class="muted">Capture every task with a polished form and keep your recent work visible in a modern workspace.</p>
        </div>
      </section>

      <section class="form-card">
        <div class="grid">
          <label>
            <span>Title</span>
            <input [(ngModel)]="title" placeholder="e.g. Investigate ticket backlog" />
          </label>

          <label>
            <span>Description</span>
            <input [(ngModel)]="description" placeholder="Short details" />
          </label>

          <label>
            <span>Type</span>
            <select [(ngModel)]="taskType">
              <option value="Bug">Bug</option>
              <option value="Adhoc">Adhoc</option>
              <option value="CR">CR</option>
              <option value="Email-Query">Email-Query</option>
              <option value="Email-Bug-Adhoc">Email-Bug-Adhoc</option>
            </select>
          </label>

          <label>
            <span>Status</span>
            <select [(ngModel)]="status">
              <option value="TCS Pending">TCS Pending</option>
              <option value="WIP">WIP</option>
              <option value="ECU Pending">ECU Pending</option>
              <option value="Complete">Complete</option>
            </select>
          </label>

          <label>
            <span>Shift</span>
            <select [(ngModel)]="shiftTime">
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="General">General</option>
            </select>
          </label>

          <label>
            <span>Assigned</span>
            <select [(ngModel)]="assignedToUserName">
              <option value="">Unassigned</option>
              <option *ngFor="let user of users" [value]="user.username">{{ user.username }}</option>
            </select>
          </label>
        </div>

        <div class="actions">
          <button class="primary-btn" type="button" (click)="submit()">Save task</button>
          <button class="ghost-btn" type="button" (click)="reset()">Reset</button>
        </div>

        <p class="message" *ngIf="message">{{ message }}</p>
      </section>

      <section class="preview-card" *ngIf="tasks.length">
        <div class="preview-header">
          <h3>Your latest tasks</h3>
          <span>{{ tasks.length }} recent items</span>
        </div>
        <div class="task-list">
          <article class="task-item" *ngFor="let task of pagedTasks">
            <div class="task-item-top">
              <h4>{{ task.title }}</h4>
              <span class="status-pill">{{ task.status }}</span>
            </div>
            <p>{{ task.description || 'No description yet.' }}</p>
            <div class="meta-row">
              <span><strong>Type</strong> {{ task.taskType }}</span>
              <span><strong>Shift</strong> {{ task.shiftTime }}</span>
              <span><strong>Created</strong> {{ task.createdDate }}</span>
            </div>
          </article>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button class="ghost-btn" type="button" (click)="prevPage()" [disabled]="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="ghost-btn" type="button" (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
        </div>
      </section>
    </div>
  `,
  styles: [
    `:host{display:block;padding:24px;background:linear-gradient(135deg,#f8fbff 0%,#eef4ff 100%);min-height:100vh;font-family:Inter,Segoe UI,Arial,sans-serif;}`,
    `.page-shell{display:grid;gap:18px;}`,
    `.topbar{display:flex;justify-content:flex-end;align-items:center;gap:12px;}`,
    `.back-btn,.logout-btn,.primary-btn,.ghost-btn{border:none;border-radius:999px;padding:10px 16px;font-weight:700;cursor:pointer;}`,
    `.back-btn{background:#0f766e;color:white;}`,
    `.logout-btn{background:#ef4444;color:white;}`,
    `.hero-card{background:linear-gradient(135deg,#0f172a 0%,#2563eb 45%,#14b8a6 100%);color:white;border-radius:24px;padding:24px;box-shadow:0 20px 45px rgba(37,99,235,.24);}`,
    `.eyebrow{text-transform:uppercase;letter-spacing:.24em;font-size:.72rem;opacity:.8;margin:0 0 6px;}`,
    `.hero-card h2{margin:0 0 8px;font-size:1.6rem;}`,
    `.muted{margin:0;opacity:.88;max-width:720px;line-height:1.6;}`,
    `.form-card,.preview-card{background:white;border-radius:24px;padding:20px;box-shadow:0 16px 36px rgba(15,23,42,.08);border:1px solid rgba(226,232,240,.8);}`,
    `.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;}`,
    `label{display:grid;gap:8px;}`,
    `span{font-size:.92rem;color:#0f172a;font-weight:700;}`,
    `input,select{border:1px solid #cbd5e1;border-radius:12px;padding:12px 12px;font-size:1rem;background:#fff;}`,
    `.actions{display:flex;gap:12px;margin-top:16px;align-items:center;}`,
    `.primary-btn{background:#2563eb;color:white;}`,
    `.ghost-btn{background:#e2e8f0;color:#0f172a;}`,
    `.message{margin:14px 0 0;color:#0f172a;}`,
    `.preview-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}`,
    `.preview-header h3{margin:0;color:#0f172a;}`,
    `.preview-header span{color:#64748b;font-size:.9rem;font-weight:600;}`,
    `.task-list{display:grid;gap:12px;}`,
    `.task-item{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:14px;display:grid;gap:8px;}`,
    `.task-item-top{display:flex;justify-content:space-between;align-items:center;gap:12px;}`,
    `.task-item-top h4{margin:0;color:#0f172a;}`,
    `.status-pill{background:#dbeafe;color:#1d4ed8;border-radius:999px;padding:6px 10px;font-size:.78rem;font-weight:700;}`,
    `.task-item p{margin:0;color:#334155;}`,
    `.meta-row{display:flex;flex-wrap:wrap;gap:12px;font-size:.82rem;color:#64748b;}`,
    `.meta-row strong{color:#475569;margin-right:4px;}`,
    `.pagination{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px;}`,
    `.pagination .ghost-btn:disabled{opacity:.5;cursor:not-allowed;}`
  ]
})
export class TasksComponent implements OnInit {
  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTasks();
  }

  backToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  logout(): void {

    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  title = '';
  description = '';
  taskType = 'Other';
  status = 'TCS Pending';
  shiftTime = 'General';
  assignedToUserName = '';
  isDisabled = true;

  message = '';
  users: Array<{ username: string }> = [];
  tasks: Array<{ title: string; description: string; status: string; shiftTime: string; taskType: string; createdDate: string; assignedToUserName: string }> = [];
  currentPage = 1;
  pageSize = 3;

  reset() {
    this.title = '';
    this.description = '';
    this.taskType = 'Other';
    this.status = 'TCS Pending';
    this.shiftTime = 'General';
    this.assignedToUserName = '';
    this.message = '';
  }

  submit() {
    if (!this.title.trim()) {
      this.message = 'Title is required.';
      return;
    }

    this.currentPage = 1;

    this.taskService
      .createTask({
        title: this.title,
        description: this.description,
        taskType: this.taskType,
        status: this.status,
        shiftTime: this.shiftTime,
        assignedToUserName: this.assignedToUserName
      })
      .subscribe({
        next: () => {
          this.message = 'Task saved successfully.';
          this.reset();
          this.loadTasks();
        },
        error: () => {
          this.message = 'Failed to save task.';
        }
      });
  }

  private loadUsers() {
    this.taskService.getUsers().subscribe({
      next: (res) => {
        this.users = (res ?? []).map((user: any) => ({ username: user.username }));
      },
      error: () => {
        this.users = [];
      }
    });
  }

  private loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (res) => {
        this.tasks = (res ?? []).map((t: any) => ({
          title: t.title,
          description: t.description,
          status: t.status,
          shiftTime: t.shiftTime,
          taskType: t.taskType,
          createdDate: this.formatDate(t.createdDate),
          assignedToUserName: t.assignedToUserName ?? ''
        }));
        this.currentPage = 1;
      },
      error: () => {
        this.tasks = [];
        this.currentPage = 1;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  get pagedTasks() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.tasks.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.tasks.length / this.pageSize));
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}


