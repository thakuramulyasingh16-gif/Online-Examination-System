# Online Examination System (Upgraded)

A full-stack online examination system with MySQL, Proctoring, and Admin-controlled student management.

## Features
- **MySQL Database**: All data stored in MySQL using Sequelize ORM.
- **Admin Dashboard**:
  - Student CRUD with profile image upload.
  - Exam creation with MCQ only.
  - Question management with 4 options.
  - Exam timer setting.
  - View all student results.
- **Student Portal**:
  - Login using Admin-generated ID/Password.
  - View assigned exams.
  - Attempt MCQ exams with countdown timer.
  - **Proctoring**: Live camera and microphone preview during exam.
  - Auto-submit on timeout.
  - Instant result generation.
- **Security**: JWT Authentication and Bcrypt password encryption.
- **UI**: Modern Orange + Yellow theme.

## Tech Stack
- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, Sequelize, MySQL, Multer, JWT.

## Setup Instructions

### 1. Database Setup
- Install MySQL on your system.
- Create a database named `online_exam`.
- You can use the provided `schema.sql` to see the structure, but Sequelize will automatically create the tables on the first run.

### 2. Backend Configuration
- Navigate to `backend` folder.
- Open `.env` and configure your database credentials:
  ```env
  PORT=5000
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=your_password
  DB_NAME=online_exam
  JWT_SECRET=your_secret_key
  ```
- Install dependencies: `npm install`
- Run the server: `npm start`
- **Initial Admin**: On first run, a default admin is created:
  - **Login ID**: `admin`
  - **Password**: `admin123`

### 3. Frontend Configuration
- Navigate to `frontend` folder.
- Open `.env` and ensure the API URLs are correct:
  ```env
  VITE_API_URL=http://localhost:5000/api
  VITE_API_BASE_URL=http://localhost:5000
  ```
- Install dependencies: `npm install`
- Run the app: `npm run dev`

### 4. Running the Project
- Open `http://localhost:5173` in your browser.
- Login as Admin (`admin`/`admin123`) to create students and exams.
- Login as Student to take exams.

## Proctoring Requirements
- The browser will ask for Camera and Microphone permissions during the exam.
- Ensure permissions are granted for the proctoring feature to work correctly.
- A warning will be displayed if the camera or microphone is disabled.
