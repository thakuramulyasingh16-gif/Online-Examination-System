# 🎓 City College Online Examination & AI Proctoring System

A modern, enterprise-grade, full-stack **Online Examination and Real-Time Proctoring Platform** built with **React (TypeScript), Vite, Tailwind CSS, Node.js, Express, Sequelize ORM (MySQL / PostgreSQL), and Socket.IO**.

Designed with a rich College Orange visual theme, glassmorphic dark mode, responsive layouts (Mobile 375px, Tablet, Desktop), and comprehensive anti-cheat proctoring surveillance.

---

## 🌟 Key Highlights & Features

### 👨‍🎓 1. Student Portal
- **Modern Login Experience**: Role selection tabs (`Student` / `Administrator`), floating labels, password visibility toggle, and Render cold-start service alert.
- **Student Dashboard**:
  - Personalized welcome card with current date and greeting.
  - Animated count-up stat cards (`Total Exams`, `Completed`, `Pending`, `Average Score`).
  - **Available & Upcoming Exams**: Live status badges (`Live Now`, `Upcoming`, `Ended`), real-time countdown timer until exam start, and conditional access locking.
  - Recent performance history and Recharts score trend visualization.
- **My Exams Page**: Search, sorting, and responsive filter tabs (`All`, `Live Now`, `Upcoming`, `Completed`) with dynamic counts.
- **Pre-Exam Briefing & Hardware Check**:
  - Step-by-step test rules, negative marking guidelines, duration, and pass marks.
  - Live webcam and microphone hardware permission check with live preview.
  - Mandatory honor code agreement checkbox before unlocking the Start Exam button.
- **Interactive Online Examination Interface (`/exam/:id`)**:
  - Sticky header with college emblem, exam title, and real-time countdown timer ($\le 5$ min turns red with a pulse animation).
  - Single-question focused view with large clickable MCQ option cards.
  - Navigation controls: `Previous`, `Next`, `Mark for Review`, and `Clear Response`.
  - **Color-Coded Question Palette**:
    - 🟢 **Answered** (Green)
    - 🔴 **Not Answered** (Red)
    - 🟣 **Marked for Review** (Purple)
    - ⚪ **Not Visited** (Slate/Grey)
  - **Fault-Tolerant Persistence**: Answers auto-save on every selection with `localStorage` fallback so browser refresh never loses candidate progress.
  - **Auto-Submission**: Submits automatically when timer expires.
  - **Pre-Submit Summary Modal**: Displays counts of Answered, Unanswered, and Marked questions before final submission.
- **Anti-Cheat AI Proctoring & Security**:
  - Fullscreen enforcement with automatic fullscreen request.
  - Real-time tab-switch and window-blur detection triggering instant warning modals.
  - Real-time camera snapshot streaming to Admin surveillance center via Socket.IO (`student-frame`).
  - Context menu (right-click), copy, cut, paste, and text selection are strictly disabled.
  - Automatic exam termination if warning threshold (default 10) is exceeded.
- **Post-Exam Scorecard & Review (`/results`)**:
  - Celebratory confetti animation upon passing (`canvas-confetti`).
  - Score summary card with Pass/Fail badge and animated progress bar.
  - Recharts Donut Chart breakdown (`Correct`, `Incorrect`, `Skipped`).
  - **Detailed Question Review**: Shows candidate's selected choice vs. correct answer, marks awarded, and detailed explanations.
  - **Certified PDF Export**: Generates official institutional scorecard PDF with college header, student details, exam metadata, and institutional seal using `jspdf` and `html2canvas`.
- **Student Profile (`/profile`)**:
  - Profile photo upload via Multer with instant avatar preview.
  - Roll number / Login ID and name display.
  - Password change form with security validation.

---

### 🛡️ 2. Professional Admin Dashboard (`/admin`)
Modular, professional panel layout with a responsive collapsible left sidebar and sticky top navigation bar:

#### 📊 Tab 1: System Overview
- **5 Stat Cards**: Total Students, Total Exams, Live Exams, Average Score, Total Proctoring Warnings.
- **3 Dynamic Recharts Visualizations**:
  1. *Exam-Wise Average Score Bar Chart*: Performance comparison across exams.
  2. *Pass / Fail Donut Chart*: Institutional pass rate distribution.
  3. *7-Day Attempts Line Chart*: Daily exam attempt trends and rolling average score.
- **Live Activity Feed**: Real-time chronological audit trail of student submissions, pass/fail results, and proctoring warnings.

#### 👥 Tab 2: Student Directory
- Searchable, sortable, and paginated student table with sticky header and row hover effects.
- **Add / Edit Student**: Modal with profile image upload, active/inactive toggle, and auto-generated credentials (`STU2026xxxx` / random secure password).
- **Bulk CSV Upload**: One-click import with client-side CSV validation and live parsed table preview.
- **One-Click Password Reset**: Generates a secure new password with copy-to-clipboard toast.
- **Active / Inactive Status Toggle**: Instant account deactivation preventing unauthorized logins.
- **Delete Confirmation Modal**: Prevents accidental data loss.

#### 📝 Tab 3: Exam Management
- Exam cards and data table with search and subject filtering.
- **Exam Configuration**: Title, subject, duration (minutes), total marks, pass marks, negative marking deduction per wrong answer, shuffle questions toggle, shuffle options toggle, and publish/unpublish switch.
- **Exam Scheduling**: `startTime` and `endTime` date-time pickers determining live accessibility.
- **One-Click Exam Duplication**: Clones exam metadata and all associated questions into a draft duplicate (`Title (Copy)`).
- **Delete Confirmation Modal**: Cascades safely with warning.

#### ❓ Tab 4: Question Bank & Repository
- Filter questions by exam or browse global question bank.
- Question cards displaying difficulty badges (🟢 **Easy**, 🟡 **Medium**, 🔴 **Hard**), assigned marks, options A/B/C/D, and explanation notes.
- **Add / Edit Question Modal**: Full MCQ creator with option inputs, correct answer selector, marks, and explanation text.
- **Bulk CSV Import**: Drag-and-drop or select CSV file to batch-import questions with auto-mapping for question text, options, correct option, marks, and difficulty.
- **Question Bank Import**: Easily copy existing questions from other exams into the current exam.

#### 🏆 Tab 5: Results & Performance Analytics
- Comprehensive institutional results table with search by student name/roll number and filter by exam.
- Pass/Fail status badges, percentage score, submission date, and completion status.
- **Export to CSV**: Downloads complete results report for offline reporting.
- **Detailed Student Answer Sheet Modal**: Displays candidate's exact responses against correct options and teacher explanations for verification.

#### 👁️ Tab 6: Live Proctoring Surveillance Center
- **Active Students Video Grid**: Real-time webcam snapshots received via Socket.IO from active examinees with pulsing status indicators.
- **Proctoring Action Bar**:
  - **Send Warning**: Dispatch instant modal warnings with pre-configured infractions (*"Looking away from screen"*, *"Multiple faces detected"*, *"No face in camera frame"*, *"Unauthorized tab switch detected"*).
  - **Terminate Exam**: Remotely terminate a candidate's session for severe integrity violations.
- **Real-Time Proctoring Incident Timeline**: Live stream of student activity events (tab switches, window blur events, warnings issued).

#### ⚙️ Tab 7: Portal & Security Settings
- Institutional configuration: College name, official logo upload/preview, minimum passing criteria percentage (default 40%), and proctoring warning threshold limit (default 10).
- **Admin Password Change Form**: Secure password update with current password verification.

---

## 🔒 Security & Architecture

| Layer | Implementation |
|---|---|
| **Rate Limiting** | `express-rate-limit` enforces a maximum of 25 login requests per 15-minute window per IP on `/api/auth/login`. |
| **HTTP Security Headers** | `helmet` configured with `crossOriginResourcePolicy: "cross-origin"` allowing live video canvas frames. |
| **Environment Integrity** | `JWT_SECRET` must be set in environment variables; missing secret is flagged and blocked. |
| **Default Password Check** | Initial administrator account (`admin` / `admin123`) is flagged with `mustChangePassword: true` prompting a password change upon first login. |
| **Server-Side Scoring** | Exam scores are calculated strictly on the backend comparing DB question records against candidate answers with negative marking deductions. Client-calculated scores are never accepted. |
| **Duplicate Submission Prevention** | The submission endpoint validates `(userId, examId)` and blocks duplicate attempts with `400 Bad Request`. |
| **Password Hashing** | Bcrypt with 10 salt rounds for all user credentials. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Bundler**: Vite 8 with optimized chunks
- **Styling**: Tailwind CSS v4, custom utility design system
- **Icons**: Lucide React
- **Visualizations**: Recharts (Bar, Donut/Pie, Line, Area charts)
- **PDF Generation**: jsPDF + html2canvas
- **Animation**: Canvas Confetti, Tailwind keyframe transitions
- **Real-time Client**: Socket.IO Client

### Backend
- **Runtime**: Node.js & Express
- **Database ORM**: Sequelize ORM
- **Supported Databases**:
  - **PostgreSQL**: Production (Render via `DATABASE_URL`)
  - **MySQL / TiDB Cloud**: Local development or hosted MySQL with TLS (`DB_SSL=true`)
- **Real-time Server**: Socket.IO
- **File Uploads**: Multer
- **Security**: Helmet, Express Rate Limit, BcryptJS, JSON Web Tokens

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MySQL (local) or PostgreSQL (hosted)

### 1. Clone the Repository
```bash
git clone https://github.com/thakuramulyasingh16-gif/Online-Examination-System.git
cd Online-Examination-System
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=online_exam
DB_PORT=3306
JWT_SECRET=super_secret_jwt_key_exam_portal_2026

# For Hosted MySQL (e.g. TiDB Cloud):
# DB_SSL=true

# For Production PostgreSQL (e.g. Render):
# DATABASE_URL=postgres://user:password@host:5432/dbname
```

Start the backend:
```bash
npm start
```
*Sequelize will automatically ensure tables exist and seed the default admin account:*
- **Login ID**: `admin`
- **Password**: `admin123`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

---

## 🌐 Production Deployment (Render)

This repository is pre-configured for seamless single-service deployment on **Render**:
1. In Render, create a new **Web Service** connected to branch `render-deploy`.
2. **Build Command**:
   ```bash
   cd frontend && npm install && npm run build && cd ../backend && npm install
   ```
3. **Start Command**:
   ```bash
   cd backend && node server.js
   ```
4. **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A long random string.
   - `PORT`: `5000` (or Render's default `10000`).

The Express backend serves the built React frontend (`frontend/dist`) statically with SPA client-side fallback, so all routes (`/admin`, `/exam/:id`, `/results`, `/login`) work out of the box with 0 extra routing configuration.

---

## 📱 Mobile Responsiveness (Tested Viewports)
- **Mobile (375px - 414px)**: iPhone SE, iPhone 14, Galaxy S21
- **Tablet (768px - 1024px)**: iPad Mini, iPad Air
- **Desktop (1280px+)**: HD & 4K Displays

---

## 📄 License
This project is licensed under the ISC License. Developed for educational and examination management purposes.
