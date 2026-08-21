# Smart College ERP API

Backend API for a college ERP system — manages students, faculty, subjects, notices, attendance, and results, with role-based access control.

**Note:** This is a backend-only project. No frontend UI is included; all endpoints are documented and testable via Swagger UI.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- Swagger (swagger-jsdoc + swagger-ui-express) for API documentation
- Multer for file uploads (profile images)

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the `server` directory with:
   ```
   MONGO_URI=<your MongoDB connection string>
   JWT_SECRET=<your JWT secret>
   ```

3. Start the server:
   ```bash
   node app.js
   ```
   (or `nodemon app.js` for development)

4. Open Swagger docs at:
   ```
   http://localhost:5000/api-docs
   ```

## Authentication Flow

All protected routes require a JWT sent via the `Authorization` header as a Bearer token.

### 1. Login

`POST /api/login`

Works for both Student and Faculty accounts (including admin, hod — since those are roles within the Faculty collection).

Request body:
```json
{
  "email": "admin@svcet.edu.in",
  "password": "yourpassword"
}
```

Response (200):
```json
{
  "message": "Login Successful",
  "token": "<JWT token>",
  "role": "admin"
}
```

### 2. Authorize in Swagger

- Open `http://localhost:5000/api-docs`
- Click **Authorize** (top right)
- Paste the token (no need to type "Bearer" — added automatically)
- Click Authorize → Close

All subsequent requests sent from the Swagger UI will include the token automatically.

### 3. Using the token outside Swagger (Postman / frontend)

Send it as a header on every protected request:
```
Authorization: Bearer <token>
```

## Roles & Permissions

| Role      | Description |
|-----------|-------------|
| `admin`   | Full access — manage students, faculty, subjects, notices |
| `hod`     | Read access to students, faculty, subjects |
| `faculty` | Read access to students, faculty, subjects; can view own dashboard |
| `student` | Read access to own record, subjects, notices, own dashboard |

Admin and hod are role values within the **Faculty** collection — there is no separate Admin model. To create an admin, use `POST /api/faculty` with `"role": "admin"` in the request body.

## Endpoints

### Auth

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/login` | Public | Login for Student or Faculty (returns JWT + role) |

### Students

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/student` | admin | Create a student |
| GET | `/api/students` | admin, hod, faculty | Get all students (paginated, filterable by search/department/semester) |
| GET | `/api/students/:id` | admin, hod, faculty, student | Get a student by ID |
| PUT | `/api/students/:id` | admin | Update a student |
| DELETE | `/api/students/:id` | admin | Delete a student |

**Create Student** — `POST /api/student` (multipart/form-data)

Required fields: `name`, `rollNumber`, `email`, `department`, `year`, `semester`, `section`, `password`, `profileImage` (file)
Optional: `phone`

```json
{
  "message": "student saved successfully",
  "student": { "...": "..." }
}
```

### Faculty

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/faculty` | admin | Create a faculty member (or hod/admin via `role` field) |
| GET | `/api/faculty` | admin, hod, faculty | Get all faculty (paginated, filterable) |
| GET | `/api/faculty/:id` | admin, hod, faculty | Get a faculty member by ID |
| PUT | `/api/faculty/:id` | admin | Update a faculty member |
| DELETE | `/api/faculty/:id` | admin | Delete a faculty member |

**Create Faculty** — `POST /api/faculty` (multipart/form-data)

Required fields: `facultyId`, `name`, `email`, `department`, `designation`, `password`, `profileImage` (file)
Optional: `phone`, `role` (defaults to `"faculty"`; set to `"admin"` or `"hod"` as needed)

### Subjects

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/subject` | admin | Create a subject (linked to an existing faculty via `facultyId`) |
| GET | `/api/subjects` | admin, hod, faculty, student | Get all subjects |
| GET | `/api/subject/:id` | admin, hod, faculty, student | Get a subject by ID |
| PUT | `/api/subject/:id` | admin | Update a subject |
| DELETE | `/api/subject/:id` | admin | Delete a subject |

**Create Subject** — `POST /api/subject` (application/json)

Required fields: `subjectCode`, `subjectName`, `department`, `semester`, `credits`, `facultyId`
Optional: `regulation` (defaults to `"R2022"`), `subjectType` (defaults to `"Theory"`)

```json
{
  "subjectCode": "IT301",
  "subjectName": "Database Management Systems",
  "department": "Information Technology",
  "semester": 3,
  "credits": 4,
  "facultyId": "FAC012",
  "regulation": "R2022",
  "subjectType": "Theory"
}
```

Note: `facultyId` must already exist in the Faculty collection, or the API returns `404 Faculty not found`. `subjectCode` + `department` + `regulation` must be unique together.

### Notices

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/notice` | admin | Create a notice |
| GET | `/api/notices` | admin, faculty, student | Get all notices (filterable by department/priority) |
| GET | `/api/notice/:id` | admin, faculty, student | Get a notice by ID |
| PUT | `/api/notice/:id` | admin | Update a notice |
| DELETE | `/api/notice/:id` | admin | Delete a notice |

**Create Notice** — `POST /api/notice` (application/json)

Required fields: `title`, `description`, `postedBy`, `expiryDate`
Optional: `priority` (defaults to `"Medium"`), `department` (defaults to `"All"`)

### Attendance-Session

QR-based attendance system: a faculty member creates a session and generates a QR code; students scan it to mark themselves present. Sessions expire 2 minutes after creation.

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/attendance-session` | faculty | Create an attendance session and generate a QR code |
| POST | `/api/attendance-session/scan` | student | Scan a session's QR code to mark attendance |

**Create Session** — `POST /api/attendance-session` (application/json)

Required fields: `facultyId`, `subjectCode`, `department`, `semester`, `section`

```json
{
  "facultyId": "FAC012",
  "subjectCode": "IT301",
  "department": "Information Technology",
  "semester": 3,
  "section": "A"
}
```

Response (201) includes the session document plus a `qrCode` (base64 data URL image) that students scan.

**Scan & Mark Attendance** — `POST /api/attendance-session/scan` (application/json)

Required fields: `studentId` (roll number), `sessionId`, `token` — the latter two come from the scanned QR code's decoded JSON payload (`{ sessionId, token }`).

```json
{
  "studentId": "22CS035",
  "sessionId": "<attendance session _id>",
  "token": "<token from QR code>"
}
```

Validation performed before marking attendance: session must be active and not expired (2-minute window), token must match, and the student's department/semester/section must match the session — duplicate attendance for the same subject/date is rejected.

### Attendance

Direct attendance CRUD (separate from the QR-based Attendance-Session flow above) — lets admin/faculty manually mark, view, update, or delete attendance records.

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/attendance` | admin, faculty | Manually mark attendance for a student |
| GET | `/api/attendance` | admin, hod, faculty | Get all attendance records (filterable) |
| GET | `/api/attendance/:id` | admin, hod, faculty, student | Get an attendance record by ID |
| PUT | `/api/attendance/:id` | admin, faculty | Update an attendance record |
| DELETE | `/api/attendance/:id` | admin | Delete an attendance record |

**Mark Attendance** — `POST /api/attendance` (application/json)

Required fields: `studentId` (roll number), `subjectCode`, `facultyId`, `department`, `semester`, `section`, `attendanceDate`
Optional: `status` (defaults to `"Present"`; `Present`/`Absent`/`Late`), `remarks`

```json
{
  "studentId": "22CS035",
  "subjectCode": "CS401",
  "facultyId": "FAC001",
  "department": "Computer Science Engineering",
  "semester": 5,
  "section": "A",
  "attendanceDate": "2026-08-20",
  "status": "Present",
  "remarks": "Attended the full class"
}
```

Both `studentId` and `facultyId` must reference existing records, or the API returns `404`. Only one attendance record is allowed per `studentId` + `subjectCode` + `attendanceDate` combination (unique index) — this route is for manual entry; the QR flow above (`/api/attendance-session/scan`) is the self-service alternative for students.

**Get All Attendance** — supports filtering via query params: `studentId`, `semester`, `department`, `subjectCode`, `section`.

### Dashboards

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/dashboard/admin` | admin | Summary counts: students, faculty, subjects, results, attendance |
| GET | `/api/dashboard/faculty` | faculty | Subjects handled, attendance taken, results uploaded |
| GET | `/api/dashboard/student` | student | Student profile summary + subject/result/attendance counts |

### Results

Semester results with auto-calculated grades, grade points, and GPA — grading logic runs in a Mongoose `pre("save")` hook, so it recalculates on both create and update.

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/result` | admin, faculty | Create a semester result for a student |
| GET | `/api/results` | admin, hod, faculty | Get all results (filterable by studentId/semester/department) |
| GET | `/api/result/:id` | admin, hod, faculty, student | Get a result by ID |
| PUT | `/api/result/:id` | admin, faculty | Update a result (recalculates grades/GPA) |
| DELETE | `/api/result/:id` | admin | Delete a result |

**Create Result** — `POST /api/result` (application/json)

Required fields: `studentId` (roll number), `department`, `semester`, `subjects` (array)

Each subject in `subjects` requires: `subjectCode`, `credits`
Optional per subject: `internal1`, `internal2`, `assignment`, `semesterExam` (each defaults to 0)

```json
{
  "studentId": "2024CSE001",
  "department": "CSE",
  "semester": 4,
  "subjects": [
    {
      "subjectCode": "CS401",
      "internal1": 40,
      "internal2": 40,
      "assignment": 20,
      "semesterExam": 90,
      "credits": 4
    }
  ]
}
```

On save, each subject's `total`, `grade`, and `gradePoint` are computed automatically (grading scale: 180+ = O/10, 160+ = A+/9, 140+ = A/8, 120+ = B+/7, 100+ = B/6, 90+ = C/5, below 90 = RA/0), and `semesterGPA` is the credit-weighted average across all subjects.

Note: `studentId` must reference an existing student, and the requested `semester` cannot exceed the student's current semester — the API returns `400` if it does.

## Notes

- Passwords are hashed with bcrypt via a Mongoose `pre("save")` hook — always create/update user passwords through `.save()` (via the API), never by editing documents directly in MongoDB Compass/Atlas, or the password will be stored as plaintext and login will fail.
- JWT tokens expire after 1 day.