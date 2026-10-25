# Student Management System

A full-stack student information and records management platform built with React 19, TypeScript, Express, and Tailwind CSS. The application provides end-to-end student lifecycle tracking, attendance logging, grade analytics with interactive charts, official PDF transcript generation, and Excel bulk import/export capabilities.

---

## Project Implementation Milestones

This application was engineered following five structured implementation steps:

### **Step 1: Design the Frontend Interface**
- **Design System & Typography:** Editorial academic styling using Tailwind CSS with Google Fonts (*Cormorant Garamond* serif for editorial headings, *Geist* and *Geist Mono* for tabular data).
- **Dual Display Modes:** Instant toggle between a dense, multi-column **Table View** ([StudentTable.tsx](src/components/StudentTable.tsx)) and an interactive **Profile Card Grid** ([StudentGrid.tsx](src/components/StudentGrid.tsx)).
- **Interactive Search & Highlighting:** Real-time search across roll numbers, names, departments, and emails with visual query text highlighting ([HighlightText.tsx](src/components/HighlightText.tsx)).
- **Filter & Sort Controls:** Filter by department, enrollment status, academic year, and sort dynamically by GPA, attendance, name, or roll number ([StudentFilters.tsx](src/components/StudentFilters.tsx)).
- **Cohort Analytics & Visualizations:** Visual GPA distribution histograms and cohort average GPA trends powered by Recharts ([StudentAnalyticsCharts.tsx](src/components/StudentAnalyticsCharts.tsx)).
- **Responsive Modals:** Accessible modals for adding/editing students, viewing full records, confirming deletions, logging attendance, and exploring REST APIs.

### **Step 2: Create Backend APIs**
- **Express REST Engine:** Express application initialized in [server.ts](server.ts) with strict JSON request parsing, error handling, and CORS-ready middleware.
- **Structured REST Endpoints:** Comprehensive API endpoints covering health diagnostics, student statistics, filtering, individual record querying, creation, updating, deletion, attendance recording, and batch spreadsheet imports.
- **Interactive REST API Explorer:** Built-in modal tester ([ApiExplorerModal.tsx](src/components/ApiExplorerModal.tsx)) directly inside the UI allowing live testing of GET, POST, PUT, and DELETE endpoints.

### **Step 3: Implement Database Connectivity**
- **Persistent Storage Engine:** Implemented in [server/db.ts](server/db.ts) using an atomic JSON database stored at `data/students.json`.
- **Database Connection Diagnostics:** Dedicated `/api/health` endpoint returning database connectivity status, timestamp, and service uptime.
- **Automatic Seeding & Reset:** Automatically seeds initial student records on cold start and provides an instant one-click reset endpoint (`POST /api/students/reset`) to restore the clean university demonstration dataset.
- **Data Integrity & Uniqueness:** Enforces unique roll number constraints, schema validation, and safe file write operations.

### **Step 4: Add CRUD Operations**
Full implementation of all four fundamental CRUD operations with both UI and API layers:
1. **Create:** Add new students with validation, international country codes, and numbers-only phone input.
2. **Read:** Searchable table/card grid, detailed profile modal, and official PDF transcript export.
3. **Update:** Modify student records, academic metrics, and emergency contacts with prefilled forms.
4. **Delete:** Remove student records with a safety confirmation dialog.

### **Step 5: Test Application Functionality**
- **Automated Unit Testing:** 20 automated unit tests using Node.js native test runner:
  - Student validation, GPA calculations, and attendance percentage ([studentLogic.test.ts](src/utils/studentLogic.test.ts)).
  - Fuzzy Excel column normalization and empty row handling ([excelLogic.test.ts](src/utils/excelLogic.test.ts)).
  - World country dialing codes and phone parsing ([countryCodes.test.ts](src/utils/countryCodes.test.ts)).
- **Static Type Safety:** Full TypeScript type checking (`npm run lint` / `tsc --noEmit`) passing with 0 errors.
- **Production Build Validation:** Vite production bundle compilation (`npm run build`) passing cleanly.

---

## Key Features

### 1. Add Students
- **Modal Component:** [StudentFormModal.tsx](src/components/StudentFormModal.tsx)
- **API Endpoint:** `POST /api/students`
- **Capabilities:**
  - Form validation for required fields (Roll Number, First Name, Last Name, Email, Department, GPA).
  - **Country Code Selector:** Includes every country in the world (~200 countries) with national flag emojis and dialing codes (e.g. `+1`, `+91`, `+44`, `+61`, `+971`).
  - **Numbers-Only Phone Input:** Strict keyboard guard and paste sanitizer ensuring only numeric digits (`0-9`) can be entered.
  - Duplicate roll number detection and automated attendance rate initialization.

### 2. View Student Details
- **Modal Component:** [StudentDetailModal.tsx](src/components/StudentDetailModal.tsx)
- **API Endpoint:** `GET /api/students/:id`
- **Capabilities:**
  - View full academic profiles: GPA honors classification, semester breakdown, enrollment status, and emergency contacts.
  - **Official PDF Transcript Generation:** Generates branded, tamper-evident academic transcripts via `jsPDF` with course credit weights, grades, cumulative GPA, and university seal ([pdfService.ts](src/services/pdfService.ts)).
  - View individual attendance log history and percentage rates.

### 3. Update Records
- **Modal Component:** [StudentFormModal.tsx](src/components/StudentFormModal.tsx) *(Edit Mode)*
- **API Endpoint:** `PUT /api/students/:id`
- **Capabilities:**
  - Prefilled form fields with the student's existing record.
  - Automatic phone parsing: Separates existing international phone strings into the matching country code and local digits.
  - Update academic standing, GPA, semester, address, advisor notes, and enrollment status.

### 4. Delete Records
- **Modal Component:** [DeleteConfirmModal.tsx](src/components/DeleteConfirmModal.tsx)
- **API Endpoint:** `DELETE /api/students/:id`
- **Capabilities:**
  - Safe confirmation modal preventing accidental data loss.
  - Displays student name and roll number before confirming deletion.
  - Instant UI removal with persistent database synchronization.

---

## Additional Enterprise Features

- **Daily Attendance Logger:**
  - Modal: [AttendanceLoggerModal.tsx](src/components/AttendanceLoggerModal.tsx)
  - Endpoints: `POST /api/students/:id/attendance` & `POST /api/attendance/bulk`
  - Record daily presence (*Present, Absent, Late, Excused*) with real-time percentage recalculation.
- **Excel Spreadsheet Bulk Import:**
  - Modal: [ExcelImportModal.tsx](src/components/ExcelImportModal.tsx)
  - Flexible column normalization ([excelLogic.ts](src/utils/excelLogic.ts)) handling any header variation (`Roll Number`, `Roll No`, `Student ID`, etc.) and automatically skipping blank rows.
- **Excel Spreadsheet Export:**
  - One-click export of student records into a 3-sheet `.xlsx` workbook (*Students, Analytics Summary, Departments*) via SheetJS ([excelService.ts](src/services/excelService.ts)).

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Recharts, Motion
- **Backend:** Node.js, Express, tsx
- **Documents & Workbooks:** jsPDF, SheetJS (`xlsx`)
- **Build Tool:** Vite

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- `npm`

### Installation

1. Clone or extract the project directory:
   ```bash
   cd student-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env
   ```

### Running Locally

Start the local server (both Express API backend and Vite client):

```bash
npm run dev
```

The application will be live at:
- **Web Application:** `http://localhost:3000`
- **API Health Check:** `http://localhost:3000/api/health`
- **Students API:** `http://localhost:3000/api/students`

---

## REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and database connectivity check |
| `GET` | `/api/students/stats` | Aggregate cohort metrics (total, active, average GPA, honors) |
| `GET` | `/api/students` | List students with optional search, filter, and sorting queries |
| `GET` | `/api/students/:id` | Retrieve single student by unique ID |
| `POST` | `/api/students` | **Add Student:** Register a new student record |
| `PUT` | `/api/students/:id` | **Update Record:** Modify student details and metrics |
| `DELETE` | `/api/students/:id` | **Delete Record:** Remove student from persistent registry |
| `POST` | `/api/students/bulk` | Bulk import / upsert student records from spreadsheet |
| `POST` | `/api/students/:id/attendance` | Record individual attendance log |
| `POST` | `/api/attendance/bulk` | Record batch daily attendance for a specific date |
| `POST` | `/api/students/reset` | Reset database to initial sample dataset |

---

## Testing & Quality Assurance

To run all 20 automated unit test suites in a single command:

```bash
npm test
```

Or run individual test suites:

```bash
npx tsx src/utils/studentLogic.test.ts
npx tsx src/utils/excelLogic.test.ts
npx tsx src/utils/countryCodes.test.ts
```

To run TypeScript verification:

```bash
npm run lint
```

To create a production build:

```bash
npm run build
```
