import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
        <div></div>
        <button class="back-btn" type="button" (click)="backToDashboard()">Back to Dashboard</button>
        <button class="logout-btn" type="button" (click)="logout()">Logout</button>
      </div>
      <div class="toolbar">
        <div>
          <p class="eyebrow">Task board</p>
          <h2>Add a task</h2>
          <p class="muted">Tasks are saved in the database under your logged-in username.</p>
        </div>
      </div>

      <div class="form-card">
        <div class="grid">
          <label>
            <span>Title</span>
            <input [(ngModel)]="title" placeholder="e.g. Investigate ticket backlog" />
          </label>

          <label>
            <span>Description</span>
            <input [(ngModel)]="description" placeholder="Short details" />
          </label>

          <label [class.disabled-label]="Isdisabled">
            <span >Type</span>
            <input [(ngModel)]="taskType" placeholder="Incident / Deployment / Other" disabled="Isdisabled" />
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
        </div>

        <div class="actions">
          <button class="primary-btn" (click)="submit()">Save task</button>
          <button class="ghost-btn" type="button" (click)="reset()">Reset</button>
        </div>

        <p class="message" *ngIf="message">{{ message }}</p>

        <div class="tasks-preview" *ngIf="tasks.length">
          <h3>Your latest tasks</h3>
          <ul>
            <li *ngFor="let t of tasks">{{ t.title }} — {{ t.status }} ({{ t.shiftTime }})</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [
    `:host{display:block;padding:24px;background:#f8fafc;min-height:100vh;font-family:Inter,Arial,sans-serif;}`,
    `.page-shell{display:grid;gap:18px;}`,
    `.toolbar{display:flex;justify-content:space-between;align-items:flex-start;}`,
    `.eyebrow{text-transform:uppercase;letter-spacing:.24em;font-size:.72rem;color:#2563eb;}`,
    `.muted{color:#64748b;margin:6px 0 0;}`,
    `.form-card{background:white;border-radius:20px;padding:18px;box-shadow:0 12px 24px rgba(15,23,42,.08);}`,
    `.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;}`,
    `label{display:grid;gap:8px;}`,
    `.topbar{display:flex;justify-content:flex-end;align-items:center;gap:12px;}`,
    `.back-btn{background:#4CAF50;color:white;border:none;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer;}`,
    `.back-btn:hover{background:#4CAF50;}`,
    `.logout-btn{background:#ef4444;color:white;border:none;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer;}`,
    `.logout-btn:hover{background:#45a049;}`,
    `span{font-size:.92rem;color:#0f172a;font-weight:700;}`,
    `input,select{border:1px solid #cbd5e1;border-radius:12px;padding:12px 12px;font-size:1rem;}`,
    `.actions{display:flex;gap:12px;margin-top:16px;align-items:center;}`,
    `.primary-btn,.ghost-btn{border:none;padding:10px 16px;border-radius:999px;cursor:pointer;font-weight:700;}`,
    `.primary-btn{background:#2563eb;color:white;}`,
    `.ghost-btn{background:#e2e8f0;color:#0f172a;}`,
    `.message{margin:14px 0 0;color:#0f172a;}`
  ]
})
export class TasksComponent {
  constructor(private taskService: TaskService, private router: Router) {}

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
  Isdisabled=true;

  message = '';
  tasks: Array<{ title: string; status: string; shiftTime: string }> = [];




  reset() {
    this.title = '';
    this.description = '';
    this.taskType = 'Other';
    this.status = 'TCS Pending';
    this.shiftTime = 'General';
    this.message = '';
  }

  submit() {
    if (!this.title.trim()) {
      this.message = 'Title is required.';
      return;
    }

    this.taskService
      .createTask({
        title: this.title,
        description: this.description,
        taskType: this.taskType,
        status: this.status,
        shiftTime: this.shiftTime
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

  private loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (res) => {
        this.tasks = (res ?? []).slice(0, 5).map((t: any) => ({
          title: t.title,
          status: t.status,
          shiftTime: t.shiftTime
        }));
      },
      error: () => {
        this.tasks = [];
      }
    });
  }
}


