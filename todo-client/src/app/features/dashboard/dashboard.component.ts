import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';

interface TaskView {
  id: number;
  title: string;
  description: string;
  taskType: string;
  status: string;
  shiftTime: string;
  assignedToUserName: string;
  createdDate: string;
  updatedDate: string;
  completedDate: string;
  resolutionTimeInMinutes: number;
  isCompleted: boolean;
  userName: string;
  auditDescr: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-shell">
      <div class="topbar">
        <button class="ghost-btn" type="button" routerLink="/tasks">Create task</button>
        <button class="logout-btn" type="button" (click)="logout()">Logout</button>
      </div>

      <section class="hero-card">
        <div>
          <p class="eyebrow">Modern task operations center</p>
          <h1>{{ isAdmin ? 'Team task command center' : 'Your task workspace' }}</h1>
          <p class="muted">A refreshed overview of every task, including progress, ownership, timing, and history in one place.</p>
        </div>
        <a routerLink="/tasks" class="primary-btn">Open task board</a>
      </section>

      <section class="stats-grid">
        <div class="stat-card"><span>Total tasks</span><strong>{{ summary.total ?? 0 }}</strong></div>
        <div class="stat-card"><span>Pending</span><strong>{{ summary.pending ?? 0 }}</strong></div>
        <div class="stat-card"><span>WIP</span><strong>{{ summary.wip ?? 0 }}</strong></div>
        <div class="stat-card"><span>ECU pending</span><strong>{{ summary.ecuPending ?? 0 }}</strong></div>
        <div class="stat-card"><span>Completed</span><strong>{{ summary.completed ?? 0 }}</strong></div>
      </section>

      <section class="board-card">
        <div class="board-header">
          <div>
            <p class="eyebrow">{{ isAdmin ? 'Admin view' : 'My workspace' }}</p>
            <h3>{{ isAdmin ? 'All team tasks' : 'Your tasks' }}</h3>
          </div>
          <div class="count-pill">{{ allTasks.length }} tasks</div>
        </div>

        <div class="board-grid">
          <div class="board-col" *ngFor="let column of boardColumns" [ngClass]="column.key">
            <div class="column-heading">
              <h4>{{ column.title }}</h4>
              <span>{{ getColumnTasks(column.key).length }}</span>
            </div>

            <div class="task-stack" *ngIf="getPagedColumnTasks(column.key).length; else emptyState">
              <article class="task-card" *ngFor="let task of getPagedColumnTasks(column.key)">
                <div class="task-card-top">
                  <div>
                    <h5>{{ task.title }}</h5>
                    <p class="task-owner">{{ isAdmin ? 'Owner: ' + (task.assignedToUserName || task.userName) : (task.assignedToUserName ? 'Assigned to ' + task.assignedToUserName : 'Assigned to you') }}</p>
                  </div>
                  <span class="status-pill" [class]="getStatusClass(task.status)">{{ task.status }}</span>
                </div>

                <p class="task-description">{{ task.description || 'No description provided.' }}</p>

                <div class="task-meta-grid">
                  <div><strong>Type</strong><span>{{ task.taskType }}</span></div>
                  <div><strong>Shift</strong><span>{{ task.shiftTime }}</span></div>
                  <div><strong>Created</strong><span>{{ task.createdDate }}</span></div>
                  <div><strong>Updated</strong><span>{{ task.updatedDate }}</span></div>
                  <div *ngIf="task.completedDate !== '—'"><strong>Completed</strong><span>{{ task.completedDate }}</span></div>
                  <div *ngIf="task.resolutionTimeInMinutes"><strong>Resolution</strong><span>{{ task.resolutionTimeInMinutes }} min</span></div>
                </div>

                <div class="task-actions">
                  <button class="action-btn" *ngIf="task.status !== 'Complete'" type="button" (click)="editStatus(task.id, 'Complete')">Mark complete</button>
                  <button class="action-btn secondary" *ngIf="task.status !== 'WIP' && task.status !== 'Complete'" type="button" (click)="editStatus(task.id, 'WIP')">Move to WIP</button>
                  <button class="action-btn secondary" *ngIf="task.status !== 'ECU Pending' && task.status !== 'Complete'" type="button" (click)="editStatus(task.id, 'ECU Pending')">Send to ECU</button>
                </div>

              </article>
            </div>

            <div class="pagination" *ngIf="getTotalPages(column.key) > 1">
              <button class="ghost-btn" type="button" (click)="prevPage(column.key)" [disabled]="getCurrentPage(column.key) === 1">Previous</button>
              <span>Page {{ getCurrentPage(column.key) }} of {{ getTotalPages(column.key) }}</span>
              <button class="ghost-btn" type="button" (click)="nextPage(column.key)" [disabled]="getCurrentPage(column.key) === getTotalPages(column.key)">Next</button>
            </div>

            <ng-template #emptyState>
              <div class="empty-state">No tasks in this stage yet.</div>
            </ng-template>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `:host{display:block;padding:24px;background:linear-gradient(135deg,#f8fbff 0%,#eef4ff 100%);min-height:100vh;font-family:Inter,Segoe UI,Arial,sans-serif;}`,
    `.page-shell{display:grid;gap:22px;}`,
    `.topbar{display:flex;justify-content:flex-end;align-items:center;gap:12px;}`,
    `.ghost-btn,.logout-btn,.primary-btn,.action-btn{border:none;border-radius:999px;padding:10px 16px;font-weight:700;cursor:pointer;transition:transform .2s, box-shadow .2s;}`,
    `.ghost-btn{background:#e2e8f0;color:#0f172a;}`,
    `.ghost-btn:hover,.primary-btn:hover,.action-btn:hover{transform:translateY(-1px);}`,
    `.logout-btn{background:#ef4444;color:white;}`,
    `.primary-btn{background:linear-gradient(135deg,#2563eb,#4f46e5);color:white;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;}`,
    `.hero-card{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:28px;border-radius:24px;background:linear-gradient(135deg,#0f172a 0%,#2563eb 45%,#14b8a6 100%);color:white;box-shadow:0 20px 45px rgba(37,99,235,.24);}`,
    `.eyebrow{text-transform:uppercase;letter-spacing:.24em;font-size:.72rem;opacity:.8;margin:0 0 6px;}`,
    `.hero-card h1{margin:0 0 8px;font-size:1.8rem;}`,
    `.muted{margin:0;opacity:.88;max-width:720px;line-height:1.6;}`,
    `.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;}`,
    `.stat-card{background:white;border-radius:20px;padding:20px;box-shadow:0 16px 36px rgba(15,23,42,.08);border:1px solid rgba(226,232,240,.8);}`,
    `.stat-card span{display:block;color:#64748b;font-size:.92rem;margin-bottom:6px;}`,
    `.stat-card strong{font-size:2rem;color:#0f172a;}`,
    `.board-card{background:white;border-radius:24px;padding:24px;box-shadow:0 16px 36px rgba(15,23,42,.08);border:1px solid rgba(226,232,240,.8);}`,
    `.board-header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px;}`,
    `.board-header h3{margin:0;font-size:1.3rem;color:#0f172a;}`,
    `.count-pill{background:#eff6ff;color:#2563eb;padding:8px 12px;border-radius:999px;font-weight:700;}`,
    `.board-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;}`,
    `.board-col{border-radius:18px;padding:14px;box-shadow:inset 0 0 0 1px rgba(15,23,42,.06);display:flex;flex-direction:column;gap:12px;}`,
    `.board-col.complete{background:#ecfdf5;}`,
    `.board-col.ecuPending{background:#fffbeb;}`,
    `.board-col.wip{background:#eff6ff;}`,
    `.board-col.pending{background:#fef2f2;}`,
    `.column-heading{display:flex;justify-content:space-between;align-items:center;}`,
    `.column-heading h4{margin:0;font-size:1rem;color:#0f172a;}`,
    `.column-heading span{background:rgba(255,255,255,.75);padding:4px 8px;border-radius:999px;font-size:.82rem;font-weight:700;color:#334155;}`,
    `.task-stack{display:grid;gap:12px;}`,
    `.task-card{background:white;border-radius:16px;padding:14px;box-shadow:0 10px 24px rgba(15,23,42,.08);display:grid;gap:10px;}`,
    `.task-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;}`,
    `.task-card-top h5{margin:0 0 4px;font-size:1rem;color:#0f172a;}`,
    `.task-owner{margin:0;font-size:.82rem;color:#64748b;}`,
    `.status-pill{padding:6px 10px;border-radius:999px;font-size:.75rem;font-weight:700;}`,
    `.status-pill.complete{background:#dcfce7;color:#15803d;}`,
    `.status-pill.ecuPending{background:#fef3c7;color:#b45309;}`,
    `.status-pill.wip{background:#dbeafe;color:#1d4ed8;}`,
    `.status-pill.pending{background:#fee2e2;color:#dc2626;}`,
    `.task-description{margin:0;color:#334155;font-size:.92rem;line-height:1.5;}`,
    `.task-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}`,
    `.task-meta-grid div{display:flex;flex-direction:column;gap:2px;font-size:.8rem;color:#64748b;}`,
    `.task-meta-grid strong{color:#475569;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;}`,
    `.task-actions{display:flex;flex-wrap:wrap;gap:8px;}`,
    `.action-btn{background:#2563eb;color:white;padding:8px 12px;font-size:.8rem;}`,
    `.action-btn.secondary{background:#e2e8f0;color:#0f172a;}`,
    `.audit{display:grid;gap:4px;padding-top:6px;border-top:1px solid #e2e8f0;color:#64748b;font-size:.8rem;}`,
    `.audit strong{color:#475569;text-transform:uppercase;letter-spacing:.08em;}`,
    `.empty-state{padding:16px;border-radius:14px;background:rgba(255,255,255,.7);color:#64748b;text-align:center;font-size:.92rem;}`,
    `.pagination{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;}`,
    `.pagination .ghost-btn:disabled{opacity:.5;cursor:not-allowed;}`
  ]
})
export class DashboardComponent implements OnInit {
  isAdmin = false;
  summary: { total?: number; pending?: number; wip?: number; completed?: number; ecuPending?: number } = {};
  allTasks: TaskView[] = [];
  tasksByStatus: { complete: TaskView[]; ecuPending: TaskView[]; wip: TaskView[]; pending: TaskView[] } = { complete: [], ecuPending: [], wip: [], pending: [] };
  columnPages: { complete: number; ecuPending: number; wip: number; pending: number } = { complete: 1, ecuPending: 1, wip: 1, pending: 1 };
  pageSize = 3;
  boardColumns = [
    { key: 'pending', title: 'Pending' },
    { key: 'wip', title: 'WIP' },
    { key: 'ecuPending', title: 'ECU Pending' },
    { key: 'complete', title: 'Complete' }
  ];

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

      const role = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload?.role;
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'Complete': return 'status-pill complete';
      case 'ECU Pending': return 'status-pill ecuPending';
      case 'WIP': return 'status-pill wip';
      default: return 'status-pill pending';
    }
  }

  getColumnTasks(key: string): TaskView[] {
    return this.tasksByStatus[key as keyof typeof this.tasksByStatus] ?? [];
  }

  getPagedColumnTasks(key: string): TaskView[] {
    const tasks = this.getColumnTasks(key);
    const page = this.columnPages[key as keyof typeof this.columnPages] ?? 1;
    const start = (page - 1) * this.pageSize;
    return tasks.slice(start, start + this.pageSize);
  }

  getCurrentPage(key: string): number {
    return this.columnPages[key as keyof typeof this.columnPages] ?? 1;
  }

  getTotalPages(key: string): number {
    const tasks = this.getColumnTasks(key);
    return Math.max(1, Math.ceil(tasks.length / this.pageSize));
  }

  nextPage(key: string): void {
    if ((this.columnPages[key as keyof typeof this.columnPages] ?? 1) < this.getTotalPages(key)) {
      this.columnPages[key as keyof typeof this.columnPages] = (this.columnPages[key as keyof typeof this.columnPages] ?? 1) + 1;
    }
  }

  prevPage(key: string): void {
    if ((this.columnPages[key as keyof typeof this.columnPages] ?? 1) > 1) {
      this.columnPages[key as keyof typeof this.columnPages] = (this.columnPages[key as keyof typeof this.columnPages] ?? 1) - 1;
    }
  }

  private loadBoardTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (res: any[]) => {
        const tasks = (res ?? []).map((t: any) => this.mapTask(t));
        this.allTasks = tasks;
        this.tasksByStatus = {
          complete: tasks.filter((task) => task.status === 'Complete'),
          ecuPending: tasks.filter((task) => task.status === 'ECU Pending'),
          wip: tasks.filter((task) => task.status === 'WIP'),
          pending: tasks.filter((task) => task.status === 'TCS Pending')
        };
        this.columnPages = { complete: 1, ecuPending: 1, wip: 1, pending: 1 };
      },
      error: () => {
        this.allTasks = [];
        this.tasksByStatus = { complete: [], ecuPending: [], wip: [], pending: [] };
        this.columnPages = { complete: 1, ecuPending: 1, wip: 1, pending: 1 };
      }
    });
  }

  private mapTask(task: any): TaskView {
    return {
      id: task.id,
      title: task.title ?? 'Untitled task',
      description: task.description ?? '',
      taskType: task.taskType ?? 'Other',
      status: task.status ?? 'TCS Pending',
      shiftTime: task.shiftTime ?? 'General',
      assignedToUserName: task.assignedToUserName ?? '',
      createdDate: this.formatDate(task.createdDate),
      updatedDate: this.formatDate(task.updatedDate),
      completedDate: this.formatDate(task.completedDate),
      resolutionTimeInMinutes: task.resolutionTimeInMinutes ?? 0,
      isCompleted: !!task.isCompleted,
      userName: task.userName ?? 'Unknown',
      auditDescr: task.auditDescr ?? ''
    };
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

