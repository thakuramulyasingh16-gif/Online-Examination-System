# PROJECT REPORT

## ONLINE EXAMINATION SYSTEM WITH REAL-TIME PROCTORING

---

**STUDENT DETAILS:**
- **Student Name:** Amulya Pratap Singh
- **Course:** BCA (Final Year)
- **College Name:** [Add your college name here]
- **Submission Year:** 2026

---

### 1. TITLE PAGE
(This page should be formatted as a separate cover page in MS Word)

**Project Title:** Online Examination System with Real-Time Proctoring
**Submitted By:** Amulya Pratap Singh
**Roll Number:** [Your Roll Number]
**Course:** BCA (Bachelor of Computer Applications)
**Batch:** 2023-2026
**College:** [Your College Name]

---

### 2. INTRODUCTION
An **Online Examination System** is a digital platform used to conduct tests and assessments over the internet. Unlike traditional paper-based exams, this system allows students to take exams from any location using their personal computers or laptops.

With the rise of remote learning, the **importance of digital exams** has grown significantly. They offer efficiency, instant results, and reduce the logistical burden of physical exam centers. However, maintaining the integrity of these exams is a challenge.

This project introduces a **Proctoring System** that uses real-time monitoring to prevent cheating. By using the student's camera and tracking their system activity (like switching tabs), the system ensures a fair and secure examination environment.

---

### 3. OBJECTIVES
The primary goals of this project are:
- **Conduct Exams Online:** Provide a seamless interface for students to attempt exams remotely.
- **Auto-Evaluation of MCQs:** Automatically calculate scores as soon as the student submits the exam.
- **Prevent Cheating:** Use a real-time monitoring system to track student behavior.
- **Instant Result Generation:** Allow students to view their performance immediately after completion.
- **Admin Control:** Enable administrators to manage exams, questions, and monitor students live.

---

### 4. METHODOLOGY / WORKING

#### A. System Architecture
The system follows a **MERN-like architecture** but uses **MySQL** for relational data management:
- **Frontend:** Built with **React.js** and **TypeScript** for a fast, responsive, and type-safe user interface.
- **Backend:** Powered by **Node.js** and **Express.js** to handle API requests and business logic.
- **Real-Time Communication:** **Socket.io** is used for live webcam streaming and instant warning alerts.
- **Database:** **MySQL** stores all persistent data like users, questions, and results.

#### B. Admin Module
The Admin acts as the controller of the system:
- **Create Exam:** Define exam titles and durations.
- **Add Questions:** Create Multiple Choice Questions (MCQs) with four options and a correct answer.
- **Monitor Students (Command Center):** View live webcam feeds of all students currently taking an exam.
- **Send Warnings:** Send real-time text warnings to students if suspicious activity is detected.

#### C. Student Module
- **Secure Login:** Students log in using their unique credentials.
- **Attempt Exam:** A clean interface showing one question at a time with a countdown timer.
- **Camera Access:** The system requires mandatory camera and microphone access before starting the exam.

#### D. Proctoring System (The Core Logic)
- **Camera Monitoring:** The system captures frames from the student's webcam every 3 seconds and sends them to the Admin dashboard.
- **Activity Tracking:**
  - **Tab Switching:** Detects if a student leaves the exam tab or minimizes the window.
  - **Fullscreen Enforcement:** Ensures the student remains in fullscreen mode throughout the exam.
  - **Input Restrictions:** Disables right-click, copy, and paste functions to prevent external help.
- **Warning System:** If a student violates rules, the admin sends a warning. If the student receives **more than 10 warnings**, the exam is automatically blocked and terminated.

#### E. Database Design (MySQL)
- **Users Table:** Stores names, login IDs, passwords (hashed), and roles (Admin/Student).
- **Exams Table:** Stores exam details and duration.
- **Questions Table:** Stores MCQ data linked to specific exams.
- **Results Table:** Stores scores, percentages, and completion status.
- **Activity Logs Table:** Records every "suspicious" event (e.g., Tab Switch) with a timestamp.
- **Warnings Table:** Tracks the count and messages of warnings given to each student.

---

### 5. SCREENSHOTS SECTION
(Place these screenshots in your Word document with the captions provided)

- **[Insert Screenshot: Login Page]**
  *Caption: Figure 5.1 - Secure Login Interface for Students and Admins.*

- **[Insert Screenshot: Admin Dashboard]**
  *Caption: Figure 5.2 - Administrator Panel for managing Exams and Questions.*

- **[Insert Screenshot: Student Dashboard]**
  *Caption: Figure 5.3 - Student portal showing available examinations.*

- **[Insert Screenshot: Exam Page with Timer]**
  *Caption: Figure 5.4 - Active Exam Interface with real-time countdown and camera indicator.*

- **[Insert Screenshot: Command Center / Monitoring Panel]**
  *Caption: Figure 5.5 - Real-time Proctoring Dashboard showing live student feeds.*

- **[Insert Screenshot: Warning Popup]**
  *Caption: Figure 5.6 - Warning alert displayed to the student upon rule violation.*

---

### 6. TECHNOLOGIES USED
- **Frontend:** React.js, TypeScript, Tailwind CSS, Lucide-React Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL (using Sequelize ORM).
- **Real-Time:** Socket.io (for streaming and alerts).
- **Security:** JWT (JSON Web Tokens) for authentication, Bcrypt.js for password hashing.
- **File Handling:** Multer (for profile image uploads).

---

### 7. SYSTEM REQUIREMENTS

#### Hardware Requirements:
- **Processor:** Intel i3 or higher / AMD Ryzen 3 or higher.
- **RAM:** 4GB minimum (8GB recommended).
- **Camera:** Standard Web Camera (Integrated or USB).
- **Internet:** Stable connection (min 1 Mbps for streaming).

#### Software Requirements:
- **Operating System:** Windows 10/11, macOS, or Linux.
- **Browser:** Google Chrome or Microsoft Edge (for Fullscreen API support).
- **Tools:** Node.js, MySQL Server, VS Code.

---

### 8. CONCLUSION
The **Online Examination System with Real-Time Proctoring** successfully provides a secure and automated platform for academic assessments. By integrating real-time monitoring and activity tracking, it addresses the major challenge of cheating in remote exams. The system is scalable, user-friendly, and ensures that the integrity of the examination process is maintained digitally.

---

### 9. FUTURE ENHANCEMENTS
- **AI Face Detection:** Use machine learning to automatically detect if multiple people are in the frame.
- **Object Detection:** Detect mobile phones or books in the camera view using AI.
- **Browser Lockdown:** Develop a dedicated desktop application to completely lock the user's OS during the exam.
- **Audio Analysis:** Use AI to detect background noise or talking during the exam.

---

### INSTRUCTIONS TO CONVERT TO PDF:
1. **Copy the content:** Select and copy the text above into a new **Microsoft Word** document.
2. **Apply Formatting:**
   - Use **Heading 1** for section titles (Introduction, Objectives, etc.).
   - Use **Bold** for sub-points.
   - Insert the actual screenshots of your project in the placeholders.
3. **Save as PDF:**
   - Go to **File > Save As**.
   - Select the folder where you want to save.
   - In the "Save as type" dropdown, select **PDF (*.pdf)**.
   - Click **Save**.
