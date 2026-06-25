import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:5023/api';

  constructor(private http: HttpClient) {}

  login(payload: { usernameOrEmail: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, payload);
  }

  register(payload: { username: string; email: string; password: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, payload);
  }

  getTasks(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>(`${this.apiUrl}/tasks`, { headers });
  }

  createTask(payload: {
    title: string;
    description: string;
    taskType: string;
    status: string;
    shiftTime: string;
  }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Backend expects: TaskCreateRequest(string Title, string Description, string TaskType, string Status, string ShiftTime)
    return this.http.post<any>(`${this.apiUrl}/tasks`, payload, { headers });
  }

  getDashboardSummary(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/dashboard/summary`, { headers });
  }

  updateTaskStatus(id: number, status: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.put<any>(`${this.apiUrl}/tasks/${id}`, { status }, { headers });
  }
}

