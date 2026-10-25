import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { studentDb } from './server/db';
import { StudentFilters } from './src/types/student';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Student Management System REST API',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  });

  // REST API: Get Student Stats
  app.get('/api/students/stats', (_req: Request, res: Response) => {
    try {
      const stats = studentDb.getStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch student statistics' });
    }
  });

  // REST API: Get All Students with filters & sorting
  app.get('/api/students', (req: Request, res: Response) => {
    try {
      const filters: Partial<StudentFilters> = {
        search: (req.query.search as string) || '',
        department: (req.query.department as string) || 'All',
        status: (req.query.status as string) || 'All',
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc',
      };

      const students = studentDb.getAll(filters);
      res.json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch student records' });
    }
  });

  // REST API: Get Single Student by ID
  app.get('/api/students/:id', (req: Request, res: Response) => {
    try {
      const student = studentDb.getById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, error: `Student with ID "${req.params.id}" not found` });
      }
      res.json({ success: true, data: student });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch student details' });
    }
  });

  // REST API: Create New Student Record
  app.post('/api/students', (req: Request, res: Response) => {
    try {
      const result = studentDb.create(req.body);
      if (result.error) {
        return res.status(400).json({ success: false, error: result.error });
      }
      res.status(201).json({
        success: true,
        message: 'Student record created successfully',
        data: result.student,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to create student record' });
    }
  });

  // REST API: Update Existing Student Record
  app.put('/api/students/:id', (req: Request, res: Response) => {
    try {
      const result = studentDb.update(req.params.id, req.body);
      if (result.error) {
        const statusCode = result.error.includes('not found') ? 404 : 400;
        return res.status(statusCode).json({ success: false, error: result.error });
      }
      res.json({
        success: true,
        message: 'Student record updated successfully',
        data: result.student,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to update student record' });
    }
  });

  // REST API: Delete Student Record
  app.delete('/api/students/:id', (req: Request, res: Response) => {
    try {
      const result = studentDb.delete(req.params.id);
      if (!result.success) {
        return res.status(404).json({ success: false, error: result.error || 'Student not found' });
      }
      res.json({
        success: true,
        message: `Student with ID "${req.params.id}" successfully deleted`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to delete student record' });
    }
  });

  // REST API: Bulk Import / Upsert Students (from Excel / CSV)
  app.post('/api/students/bulk', (req: Request, res: Response) => {
    try {
      const { students } = req.body;
      if (!Array.isArray(students)) {
        return res.status(400).json({ success: false, error: 'Expected an array of student records under "students"' });
      }
      const result = studentDb.bulkUpsert(students);
      res.json({
        success: true,
        message: `Successfully processed ${students.length} records (${result.added} added, ${result.updated} updated)`,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to bulk import students' });
    }
  });

  // REST API: Log Single Student Attendance
  app.post('/api/students/:id/attendance', (req: Request, res: Response) => {
    try {
      const { date, status, notes } = req.body;
      if (!date || !status) {
        return res.status(400).json({ success: false, error: 'Both date and status are required' });
      }
      const result = studentDb.recordAttendance(req.params.id, date, status, notes);
      if (result.error) {
        return res.status(404).json({ success: false, error: result.error });
      }
      res.json({
        success: true,
        message: 'Attendance recorded successfully',
        data: result.student,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to record attendance' });
    }
  });

  // REST API: Log Bulk Attendance
  app.post('/api/attendance/bulk', (req: Request, res: Response) => {
    try {
      const { date, records } = req.body;
      if (!date || !Array.isArray(records)) {
        return res.status(400).json({ success: false, error: 'date and records array are required' });
      }
      const result = studentDb.recordBulkAttendance(date, records);
      res.json({
        success: true,
        message: `Attendance logged for ${result.updatedCount} students on ${date}`,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to record bulk attendance' });
    }
  });

  // REST API: Reset database with demo data
  app.post('/api/students/reset', (_req: Request, res: Response) => {
    try {
      const seeded = studentDb.resetSeed();
      res.json({
        success: true,
        message: 'Database reset to initial demo dataset',
        count: seeded.length,
        data: seeded,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to reset database' });
    }
  });

  // Dev vs Production Vite handling
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Management System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
