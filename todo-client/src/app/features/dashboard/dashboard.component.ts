import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-shell">
      <div class="topbar">
        <div></div>
        <button class="logout-btn" type="button" (click)="logout()">Logout</button>
      </div>
      <div class="hero-card">
        <div>
          <p class="eyebrow">Enterprise task control center</p>
          <h1>Task Management Workspace</h1>
          <p class="muted">Track daily work, monitor completion, and keep teams aligned with a polished operational dashboard.</p>
        </div>
        <a routerLink="/tasks" class="primary-btn">Open Task Board</a>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><span>Total Tasks</span><strong>{{ summary.total ?? 0 }}</strong></div>
        <div class="stat-card"><span>Pending</span><strong>{{ summary.pending ?? 0 }}</strong></div>
        <div class="stat-card"><span>WIP</span><strong>{{ summary.wip ?? 0 }}</strong></div>
        <div class="stat-card"><span>Complete</span><strong>{{ summary.completed ?? 0 }}</strong></div>
      </div>

      <div class="board-card">
        <div class="board-header">
          <h3>Your tasks by status</h3>
          <!-- <p class="muted">Backend automatically filters for Admin vs User.</p> -->
        </div>

        <div class="board-grid">
          <div class="board-col complete">
            <h4>Complete</h4>
            <ul>
              <li *ngFor="let t of tasksByStatus.complete">
                <span class="task-title">{{ t.title }}</span>
                <span class="task-user" *ngIf="isAdmin"> - {{ t.userName }}  </span>
                <!-- <button class="edit-btn" (click)="editStatus(t.id,'WIP')"> Move </button> -->
              </li>
              <li *ngIf="tasksByStatus.complete.length === 0">No tasks</li>
            </ul>
          </div>

          <div class="board-col ecuPending">
            <h4>ECU Pending</h4>
            <ul>
              <li *ngFor="let t of tasksByStatus.ecuPending">
                <span class="task-title">{{ t.title }}</span>
                <span class="task-user" *ngIf="isAdmin"> - {{ t.userName }} - </span>
                <!-- <button class="edit-btn" (click)="editStatus(t.id,'Complete')"> Move </button> -->
                  <button class="edit-btn" (click)="editStatus(t.id,'WIP')"> Move to WIP </button>
                  <button class="edit-btn" (click)="editStatus(t.id,'Complete')"> Move to Complete </button>
              </li>
              <li *ngIf="tasksByStatus.ecuPending.length === 0">No tasks</li>
            </ul>
          </div>

          <div class="board-col wip">
            <h4>WIP</h4>
            <ul>
              <li *ngFor="let t of tasksByStatus.wip">
                <span class="task-title">{{ t.title }}</span>
                <span class="task-user" *ngIf="isAdmin"> - {{ t.userName }} - </span>
                <button class="edit-btn" (click)="editStatus(t.id,'ECU Pending')"> Move </button>
              </li>
              <li *ngIf="tasksByStatus.wip.length === 0">No tasks</li>
            </ul>
          </div>

          <div class="board-col pending">
            <h4>Pending</h4>
            <ul>
              <li *ngFor="let t of tasksByStatus.pending">
                <span class="task-title">{{ t.title }}</span>
                <span class="task-user" *ngIf="isAdmin"> - {{ t.userName }} - </span>
                <button class="edit-btn" (click)="editStatus(t.id,'WIP')"> Move </button>
              </li>
              <li *ngIf="tasksByStatus.pending.length === 0">No tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `:host{display:block;padding:24px;background:#f8fafc;min-height:100vh;font-family:Inter,Arial,sans-serif;}`,
    `.page-shell{display:grid;gap:24px;}`,
    `.hero-card{display:flex;justify-content:space-between;align-items:center;padding:28px;border-radius:24px;background:linear-gradient(135deg,#2563eb,#14b8a6);color:white;box-shadow:0 18px 40px rgba(37,99,235,.25);}`,
    `.eyebrow{text-transform:uppercase;letter-spacing:.24em;font-size:.72rem;opacity:.85;}`,
    `.muted{opacity:.9;max-width:640px;}`,
    `.primary-btn{background:white;color:#2563eb;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;}`,
    `.topbar{display:flex;justify-content:flex-end;align-items:center;gap:12px;}`,
    `.logout-btn{background:#ef4444;color:white;border:none;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer;}`,
    `.logout-btn:hover{background:#dc2626;}`,
    `.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;}`,
    `.stat-card{background:white;border-radius:20px;padding:20px;box-shadow:0 12px 24px rgba(15,23,42,.08);}`,
    `.stat-card span{display:block;color:#64748b;font-size:.95rem;}`,
    `.stat-card strong{font-size:2rem;color:#0f172a;}`,

    /* Board styling */
    `.board-card{background:white;border-radius:20px;padding:24px;box-shadow:0 12px 28px rgba(15,23,42,.08);}`,
    `.board-header h3{font-size:1.25rem;font-weight:600;color:#0f172a;}`,
    `.board-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-top:20px;}`,
    `.board-col{border-radius:16px;padding:16px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.05);}`,
    `.board-col h4{font-size:1rem;font-weight:600;margin-bottom:12px;}`,

    /* Status coloring */
    `.board-col.complete{background:#ecfdf5;} .board-col.complete h4{color:#16a34a;}`,
    `.board-col.ecuPending{background:#fffbeb;} .board-col.ecuPending h4{color:#f59e0b;}`,
    `.board-col.wip{background:#eff6ff;} .board-col.wip h4{color:#2563eb;}`,
    `.board-col.pending{background:#fef2f2;} .board-col.pending h4{color:#dc2626;}`,

    /* Task items */
    `.task-title{font-size:.95rem;color:#0f172a;}`,
    `.task-user{font-size:.8rem;color:#64748b;}`,
    `.edit-btn{background:#2563eb;color:white;border:none;border-radius:8px;padding:6px 12px;font-size:.8rem;cursor:pointer;transition:background .2s;}`,
    `.edit-btn:hover{background:#1e40af;}`
  ]
})
export class DashboardComponent implements OnInit {
  isAdmin = false;

  summary: { total?: number; pending?: number; wip?: number; completed?: number; ecuPending?: number } = {};

  tasksByStatus: {
    complete: Array<{ id: number; title: string; userName: string }>;
    ecuPending: Array<{ id: number; title: string; userName: string }>;
    wip: Array<{ id: number; title: string; userName: string }>;
    pending: Array<{ id: number; title: string; userName: string }>;
  } = { complete: [], ecuPending: [], wip: [], pending: [] };

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit(): void {
    this.initRoleFromJwt();
    this.loadSummary();
    this.loadBoardTasks();
  }

  private initRoleFromJwt(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payloadPart = token.split('.')[1];
      const padded = payloadPart.padEnd(payloadPart.length + ((4 - (payloadPart.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(padded));

      const role =
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        payload?.role;

      this.isAdmin = role === 'Admin';
    } catch {
      this.isAdmin = false;
    }
  }

  private loadSummary(): void {
    this.taskService.getDashboardSummary().subscribe({
      next: (res: any) => { this.summary = res ?? {}; },
      error: () => { this.summary = {}; }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  editStatus(id: number, status: string): void {
    this.taskService.updateTaskStatus(id, status).subscribe({
      next: () => this.loadBoardTasks(),
      error: () => {}
    });
  }

  private loadBoardTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (res: any[]) => {
        const tasks = (res ?? []).map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          userName: t.userName
        }));

        this.tasksByStatus = {
          complete: tasks.filter((t) => t.status === 'Complete'),
          ecuPending: tasks.filter((t) => t.status === 'ECU Pending'),
          wip: tasks.filter((t) => t.status === 'WIP'),
          pending: tasks.filter((t) => t.status === 'TCS Pending')
        };
      },
      error: () => {
        this.tasksByStatus = { complete: [], ecuPending: [], wip: [], pending: [] };
      }
    });
  }
}

