import { Student, CreateStudentDto, UpdateStudentDto, StudentFilters, StudentStats, AttendanceStatus } from '../types/student';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  }

  public async getHealth(): Promise<{ status: string; service: string; database: string }> {
    const res = await fetch('/api/health');
    return res.json();
  }

  public async getStats(): Promise<StudentStats> {
    const res = await this.request<{ success: boolean; data: StudentStats }>('/api/students/stats');
    return res.data;
  }

  public async getStudents(filters?: Partial<StudentFilters>): Promise<{ count: number; data: Student[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.department && filters.department !== 'All') params.set('department', filters.department);
    if (filters?.status && filters.status !== 'All') params.set('status', filters.status);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ success: boolean; count: number; data: Student[] }>(`/api/students${query}`);
  }

  public async getStudentById(id: string): Promise<Student> {
    const res = await this.request<{ success: boolean; data: Student }>(`/api/students/${id}`);
    return res.data;
  }

  public async createStudent(data: CreateStudentDto): Promise<Student> {
    const res = await this.request<{ success: boolean; data: Student; message: string }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  }

  public async updateStudent(id: string, data: UpdateStudentDto): Promise<Student> {
    const res = await this.request<{ success: boolean; data: Student; message: string }>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  }

  public async deleteStudent(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/students/${id}`, {
      method: 'DELETE',
    });
  }

  public async resetDemoData(): Promise<Student[]> {
    const res = await this.request<{ success: boolean; count: number; data: Student[]; message: string }>(
      '/api/students/reset',
      { method: 'POST' }
    );
    return res.data;
  }

  public async bulkImportStudents(students: CreateStudentDto[]): Promise<{ added: number; updated: number; errors: string[] }> {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: { added: number; updated: number; errors: string[] };
    }>('/api/students/bulk', {
      method: 'POST',
      body: JSON.stringify({ students }),
    });
    return res.data;
  }

  public async recordAttendance(
    studentId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<Student> {
    const res = await this.request<{ success: boolean; data: Student; message: string }>(
      `/api/students/${studentId}/attendance`,
      {
        method: 'POST',
        body: JSON.stringify({ date, status, notes }),
      }
    );
    return res.data;
  }

  public async recordBulkAttendance(
    date: string,
    records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>
  ): Promise<{ updatedCount: number; students: Student[] }> {
    const res = await this.request<{
      success: boolean;
      message: string;
      data: { updatedCount: number; students: Student[] };
    }>('/api/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ date, records }),
    });
    return res.data;
  }
}

export const api = new ApiService();
