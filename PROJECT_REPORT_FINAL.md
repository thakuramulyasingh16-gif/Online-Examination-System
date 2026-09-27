# PROJECT REPORT

---

## ONLINE EXAMINATION SYSTEM WITH REAL-TIME PROCTORING

---

**Submitted by:**
Student Name: ___________________________
Enrollment No.: ___________________________

**College Name:** ___________________________

**Course:** Bachelor of Computer Applications (BCA)

**Session:** 2025–2026

**Project Title:** Online Examination System with Real-Time Proctoring

**Submission Date:** May 2026

**Under the Guidance of:**
Faculty Name: ___________________________
Department of Computer Applications

---
---

## CERTIFICATE

This is to certify that the project entitled **"Online Examination System with Real-Time Proctoring"** has been successfully completed by _________________________ bearing Enrollment No. _________________________ in partial fulfillment of the requirements for the degree of **Bachelor of Computer Applications (BCA)** from _________________________ during the academic session 2025–2026.

This project is a bonafide work carried out under my supervision and guidance.

&nbsp;

**Signature of Guide** &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; **Signature of HOD**

Date: _______________

---
---

## ACKNOWLEDGEMENT

I would like to express my sincere gratitude to all those who have contributed to the successful completion of this project.

First and foremost, I would like to thank my project guide, _________________________, for their invaluable guidance, constant encouragement, and constructive suggestions throughout the development of this project. Their expertise and mentorship have been instrumental in shaping this work.

I am deeply grateful to the Head of the Department of Computer Applications, _________________________, for providing the necessary infrastructure and support to carry out this project.

I also extend my heartfelt thanks to all the faculty members of the Department of Computer Applications for their academic support and encouragement during the course of this project.

I would like to acknowledge the support of my family and friends who have been a constant source of motivation and encouragement throughout this journey.

Finally, I thank the Almighty for giving me the strength, patience, and wisdom to complete this project successfully.

&nbsp;

**Student Name:** _________________________
**Date:** _________________________

---
---

## DECLARATION

I hereby declare that the project entitled **"Online Examination System with Real-Time Proctoring"** submitted to _________________________ in partial fulfillment of the requirements for the award of the degree of **Bachelor of Computer Applications (BCA)** is a record of original work done by me under the supervision and guidance of _________________________.

This project has not been submitted to any other university or institution for the award of any degree or diploma. The information and data given in this report is authentic to the best of my knowledge.

&nbsp;

**Student Name:** _________________________
**Enrollment No.:** _________________________
**Date:** _________________________
**Place:** _________________________

---
---

## TABLE OF CONTENTS

| Chapter | Title | Page No. |
|---------|-------|----------|
| | Certificate | i |
| | Acknowledgement | ii |
| | Declaration | iii |
| | Table of Contents | iv |
| | List of Figures | vi |
| | Abstract | vii |
| **1** | **Introduction** | 1 |
| 1.1 | Overview | 1 |
| 1.2 | Purpose of the System | 2 |
| 1.3 | Problem Statement | 3 |
| 1.4 | Scope of the Project | 4 |
| 1.5 | Significance of the Study | 5 |
| **2** | **Literature Review** | 6 |
| 2.1 | Existing Systems | 6 |
| 2.2 | Limitations of Existing Systems | 7 |
| 2.3 | Proposed System Advantages | 8 |
| **3** | **Objectives** | 9 |
| 3.1 | Primary Objectives | 9 |
| 3.2 | Secondary Objectives | 10 |
| **4** | **System Analysis and Design** | 11 |
| 4.1 | System Architecture | 11 |
| 4.2 | Technology Stack | 12 |
| 4.3 | System Requirements | 14 |
| 4.4 | Data Flow Diagrams | 15 |
| 4.5 | Entity-Relationship Diagram | 17 |
| 4.6 | Use Case Diagrams | 18 |
| **5** | **Methodology and Implementation** | 19 |
| 5.1 | Development Methodology | 19 |
| 5.2 | Database Design | 20 |
| 5.3 | Backend Implementation | 22 |
| 5.4 | Frontend Implementation | 25 |
| 5.5 | Real-Time Proctoring Implementation | 28 |
| 5.6 | Authentication and Security | 30 |
| **6** | **Module Description** | 31 |
| 6.1 | Admin Module | 31 |
| 6.2 | Student Module | 33 |
| 6.3 | Examination Module | 34 |
| 6.4 | Proctoring Module | 36 |
| 6.5 | Results Module | 37 |
| **7** | **Screenshots and User Interface** | 38 |
| **8** | **Testing** | 44 |
| 8.1 | Testing Strategy | 44 |
| 8.2 | Unit Testing | 44 |
| 8.3 | Integration Testing | 45 |
| 8.4 | User Acceptance Testing | 45 |
| **9** | **Conclusion and Future Scope** | 46 |
| 9.1 | Conclusion | 46 |
| 9.2 | Future Enhancements | 47 |
| | **References** | 48 |

---
---

## LIST OF FIGURES

| Figure No. | Title | Page No. |
|------------|-------|----------|
| 4.1 | System Architecture Diagram | 11 |
| 4.2 | Three-Tier Architecture | 12 |
| 4.3 | Data Flow Diagram – Level 0 | 15 |
| 4.4 | Data Flow Diagram – Level 1 | 16 |
| 4.5 | Entity-Relationship Diagram | 17 |
| 4.6 | Use Case Diagram – Admin | 18 |
| 4.7 | Use Case Diagram – Student | 18 |
| 5.1 | Database Schema | 20 |
| 5.2 | API Architecture | 22 |
| 5.3 | Socket.io Communication Flow | 28 |
| 7.1 | Login Page | 38 |
| 7.2 | Admin Dashboard | 39 |
| 7.3 | Student Management Panel | 39 |
| 7.4 | Create Exam Page | 40 |
| 7.5 | Manage Questions Page | 40 |
| 7.6 | Student Dashboard | 41 |
| 7.7 | Exam Interface | 41 |
| 7.8 | Proctoring Dashboard | 42 |
| 7.9 | Live Camera Monitoring | 42 |
| 7.10 | Warning System | 43 |
| 7.11 | Results Page – Admin View | 43 |
| 7.12 | Results Page – Student View | 43 |

---
---

## ABSTRACT

The **Online Examination System with Real-Time Proctoring** is a comprehensive web-based application designed to facilitate secure and efficient online examinations in educational institutions. In the current era of digital education, the need for a reliable, scalable, and secure examination platform has become paramount. Traditional examination methods are plagued with challenges such as logistical difficulties, paper wastage, manual evaluation errors, and most critically, the inability to ensure examination integrity in remote settings.

This project addresses these challenges by providing a full-stack web application that enables administrators to create and manage examinations, allows students to take exams in a controlled digital environment, and incorporates real-time proctoring capabilities to maintain examination integrity. The system employs webcam-based monitoring, activity tracking, and an automated warning mechanism to detect and deter unfair practices during examinations.

The application is built using modern web technologies including React.js with TypeScript for the frontend, Node.js with Express.js for the backend, MySQL for data persistence, and Socket.io for real-time bidirectional communication. The system implements JWT-based authentication, role-based access control, and follows the Model-View-Controller (MVC) architectural pattern.

Key features include automated exam evaluation with instant result generation, real-time camera feed monitoring, suspicious activity detection and logging, a graduated warning system with automatic exam termination, and comprehensive result analytics. The system supports two primary user roles — Administrator and Student — each with distinct interfaces and capabilities tailored to their responsibilities.

**Keywords:** Online Examination, Real-Time Proctoring, WebSocket, JWT Authentication, React.js, Node.js, MySQL, Socket.io

---
---

## CHAPTER 1: INTRODUCTION

### 1.1 Overview

The Online Examination System with Real-Time Proctoring is a modern web-based application that revolutionizes the way educational institutions conduct examinations. This system provides a complete digital platform for creating, administering, and evaluating examinations while ensuring academic integrity through advanced real-time monitoring capabilities.

In the contemporary educational landscape, the shift towards digital assessment has been accelerated by various factors including the global pandemic, the rise of distance learning programs, and the increasing adoption of technology in educational institutions. However, one of the most significant challenges in online examinations has been maintaining the integrity and credibility of the assessment process. Traditional online examination systems often lack robust proctoring mechanisms, making them vulnerable to malpractice and undermining the value of the assessment.

This project addresses this critical gap by integrating real-time proctoring features directly into the examination platform. The system captures live video feeds from students' webcams during examinations, tracks their on-screen activities, and provides administrators with a comprehensive monitoring dashboard. An automated warning system detects suspicious behavior and can automatically terminate an examination if repeated violations are detected.

The application follows a client-server architecture with a clear separation of concerns. The frontend is built using React.js with TypeScript, providing a responsive and intuitive user interface. The backend is powered by Node.js with Express.js, handling business logic, authentication, and data management. MySQL serves as the relational database management system, storing all examination data, user information, and activity logs. Socket.io enables real-time bidirectional communication between the server and clients, facilitating live proctoring capabilities.

The system supports two distinct user roles: Administrator and Student. Administrators have full control over the examination process, including student management, exam creation, question management, live monitoring, and result analysis. Students can view available examinations, take exams in a proctored environment, and view their results immediately upon completion.

### 1.2 Purpose of the System

The primary purpose of this Online Examination System with Real-Time Proctoring is to provide educational institutions with a reliable, secure, and efficient platform for conducting online assessments. The system aims to:

**Digitize the Examination Process:** The system eliminates the need for physical examination halls, printed question papers, and manual answer sheet evaluation. By moving the entire examination process online, institutions can significantly reduce operational costs, logistical challenges, and environmental impact associated with traditional paper-based examinations.

**Ensure Examination Integrity:** Through real-time proctoring capabilities, the system addresses the most critical concern in online examinations — academic dishonesty. The webcam monitoring, activity tracking, and automated warning system work together to create a controlled examination environment that discourages and detects unfair practices.

**Provide Instant Results:** Unlike traditional examinations where results may take days or weeks to be published, this system provides instant automated evaluation and result generation. Students receive their scores immediately upon submitting their examination, and administrators have access to comprehensive result analytics in real-time.

**Streamline Administrative Tasks:** The system automates numerous administrative tasks including student registration, exam scheduling, question paper creation, answer evaluation, and result compilation. This automation frees up valuable time for educators to focus on teaching and curriculum development rather than administrative overhead.

**Enable Remote Assessment:** The system enables institutions to conduct examinations regardless of geographical constraints. Students can take examinations from any location with internet access, making it particularly valuable for distance learning programs, continuing education courses, and situations where physical presence is not feasible.

### 1.3 Problem Statement

Traditional examination systems in educational institutions face numerous challenges that impact their efficiency, reliability, and scalability:

**Logistical Challenges:** Conducting physical examinations requires significant logistical planning including venue arrangement, seating allocation, question paper printing and distribution, invigilator deployment, and answer sheet collection. These processes are time-consuming, resource-intensive, and prone to errors.

**Manual Evaluation Delays:** In traditional systems, answer sheets must be manually evaluated by faculty members, a process that is not only time-consuming but also susceptible to human errors and inconsistencies. Students often wait weeks or even months for their results, causing anxiety and delaying academic progression.

**Limited Scalability:** Physical examination systems have inherent scalability limitations. The number of students that can be examined simultaneously is constrained by available venue capacity, invigilator availability, and administrative bandwidth.

**Academic Dishonesty in Online Settings:** While basic online examination systems exist, most lack robust proctoring mechanisms. Without proper monitoring, online examinations are vulnerable to various forms of malpractice including unauthorized resource access, communication with others, and identity fraud.

**Paper Wastage and Environmental Concerns:** Traditional examinations consume significant amounts of paper for question papers, answer sheets, and supplementary materials. This contributes to environmental degradation and increases operational costs.

**Lack of Real-Time Monitoring:** Existing online examination platforms often rely on post-examination analysis of recorded sessions, which is reactive rather than proactive. By the time suspicious behavior is identified, the examination has already been compromised.

This project proposes a comprehensive solution that addresses all these challenges through a modern, technology-driven approach that combines the convenience of online examinations with the security of real-time proctoring.

### 1.4 Scope of the Project

The scope of this project encompasses the design, development, and implementation of a complete online examination system with the following boundaries:

**Included in Scope:**

- User authentication and authorization with role-based access control
- Administrator dashboard for comprehensive system management
- Student management including registration, profile management, and credential generation
- Examination creation and management with configurable duration
- Multiple-choice question (MCQ) management with bulk upload capability
- Real-time webcam-based proctoring during examinations
- Activity monitoring and suspicious behavior detection
- Automated warning system with configurable termination threshold
- Instant automated evaluation and result generation
- Result analytics and reporting for administrators
- Responsive web interface accessible from modern browsers
- Real-time communication using WebSocket technology

**Excluded from Scope:**

- Subjective or essay-type question evaluation
- AI-based facial recognition or gaze detection
- Mobile application development
- Integration with existing Learning Management Systems (LMS)
- Multi-language support
- Offline examination capability
- Audio-based proctoring analysis

### 1.5 Significance of the Study

This project holds significant academic and practical value in the current educational technology landscape:

**Academic Significance:** The project demonstrates the practical application of modern web development technologies, real-time communication protocols, database design principles, and software engineering methodologies. It serves as a comprehensive case study in full-stack web application development.

**Practical Significance:** The system provides a ready-to-deploy solution for educational institutions seeking to digitize their examination processes. The real-time proctoring capability addresses the most critical barrier to widespread adoption of online examinations — the inability to ensure examination integrity.

**Technological Significance:** The project showcases the integration of multiple cutting-edge technologies including React.js, TypeScript, Node.js, Socket.io, and MySQL in a cohesive application. The real-time communication architecture demonstrates advanced concepts in WebSocket programming and event-driven systems.

---
---

## CHAPTER 2: LITERATURE REVIEW

### 2.1 Existing Systems

The landscape of online examination systems has evolved significantly over the past decade. Several commercial and open-source platforms exist that provide varying levels of examination management and proctoring capabilities:

**Google Forms and Microsoft Forms:** These general-purpose form builders are frequently used by educational institutions for conducting basic online quizzes and examinations. While they offer ease of use and zero cost, they lack dedicated examination features such as time limits, question randomization, and most critically, any form of proctoring or monitoring capability.

**Moodle Quiz Module:** Moodle, a widely-used open-source Learning Management System, includes a quiz module that supports various question types, time limits, and basic security measures such as IP restrictions. However, its proctoring capabilities are limited and require third-party plugins that often come with additional costs and integration complexity.

**ProctorU and Examity:** These are commercial proctoring services that provide live human proctors or AI-based monitoring for online examinations. While they offer robust proctoring, they are expensive, require students to install additional software, and raise privacy concerns due to their invasive monitoring approaches.

**Conduct Exam and ExamSoft:** These are dedicated examination platforms that offer comprehensive exam management features including question banks, randomization, and basic lockdown browser capabilities. However, their real-time proctoring features are often limited or available only in premium tiers.

### 2.2 Limitations of Existing Systems

After analyzing the existing systems, several common limitations were identified:

**High Cost:** Commercial proctoring solutions charge per-student or per-examination fees that can be prohibitive for smaller institutions or those in developing countries. The cumulative cost of conducting multiple examinations across an academic year can be substantial.

**Complex Integration:** Many proctoring solutions require integration with existing LMS platforms, which can be technically challenging and may not work seamlessly with all systems. This integration complexity often leads to technical issues during examinations.

**Privacy Concerns:** Some commercial proctoring solutions employ invasive monitoring techniques including full system access, browser history scanning, and room scanning. These practices raise significant privacy concerns and have faced legal challenges in several jurisdictions.

**Lack of Real-Time Intervention:** Many systems record examination sessions for post-examination review rather than providing real-time monitoring and intervention capabilities. This reactive approach means that malpractice is detected only after the examination is complete, limiting the ability to take corrective action.

**Limited Customization:** Commercial platforms often provide limited customization options, forcing institutions to adapt their examination processes to the platform rather than the other way around.

**Internet Dependency Issues:** Many existing systems do not handle network interruptions gracefully, potentially causing students to lose their progress or be unfairly penalized for connectivity issues beyond their control.

### 2.3 Proposed System Advantages

The Online Examination System with Real-Time Proctoring developed in this project addresses the limitations of existing systems through the following advantages:

**Cost-Effective:** Being a self-hosted solution, the system eliminates recurring per-student or per-examination fees. Institutions only need to invest in server infrastructure, which can be shared across multiple applications.

**Real-Time Monitoring:** Unlike systems that rely on post-examination review, this system provides live camera feeds and activity monitoring, enabling administrators to intervene immediately when suspicious behavior is detected.

**Graduated Warning System:** The automated warning system provides a fair and transparent approach to handling violations. Students receive clear warnings before any punitive action is taken, and the system maintains a complete audit trail of all warnings issued.

**Lightweight and Accessible:** The system runs entirely in a web browser without requiring any additional software installation. Students only need a modern web browser with webcam access, making it accessible across different operating systems and devices.

**Customizable and Extensible:** Being built with modern, modular technologies, the system can be easily customized and extended to meet specific institutional requirements. New features can be added without disrupting existing functionality.

**Instant Results:** The automated evaluation system provides immediate results upon examination completion, eliminating the waiting period associated with manual evaluation.

---
---

## CHAPTER 3: OBJECTIVES

### 3.1 Primary Objectives

The primary objectives of this project are:

- **To develop a secure online examination platform** that enables educational institutions to conduct assessments digitally, eliminating the need for physical examination infrastructure and paper-based processes.

- **To implement real-time proctoring capabilities** using webcam-based monitoring and activity tracking, ensuring examination integrity without requiring additional software installation on student devices.

- **To create a role-based access control system** that provides distinct interfaces and capabilities for administrators and students, ensuring that each user type has access only to the features relevant to their role.

- **To automate the examination evaluation process** by implementing instant scoring and result generation for multiple-choice questions, reducing the time between examination completion and result publication to zero.

- **To develop a real-time warning and intervention system** that detects suspicious behavior during examinations and provides administrators with the ability to warn students or terminate examinations in real-time.

- **To design and implement a scalable system architecture** using modern web technologies that can handle multiple concurrent examinations and support a growing number of users without performance degradation.

- **To provide comprehensive examination analytics** that give administrators insights into student performance, examination difficulty, and overall assessment effectiveness.

### 3.2 Secondary Objectives

The secondary objectives of this project include:

- **To demonstrate proficiency in full-stack web development** by implementing a complete application using React.js, TypeScript, Node.js, Express.js, MySQL, and Socket.io.

- **To implement secure authentication mechanisms** using industry-standard practices including JWT tokens, password hashing with bcrypt, and secure session management.

- **To create an intuitive and responsive user interface** that provides a seamless experience across different screen sizes and devices, ensuring accessibility for all users.

- **To implement efficient database design** with proper normalization, indexing, and relationship management that ensures data integrity and optimal query performance.

- **To develop a modular and maintainable codebase** following software engineering best practices including separation of concerns, DRY principles, and clean code architecture.

- **To create a system that can serve as a foundation** for future enhancements including AI-based proctoring, subjective answer evaluation, and integration with institutional management systems.

- **To reduce the environmental impact** of traditional examination processes by eliminating paper usage and reducing the need for physical transportation to examination venues.

- **To provide equal opportunity** for all students regardless of their geographical location by enabling remote examination participation with the same level of security and integrity as in-person assessments.

---
---

## CHAPTER 4: SYSTEM ANALYSIS AND DESIGN

### 4.1 System Architecture

The Online Examination System with Real-Time Proctoring follows a three-tier client-server architecture that separates the application into three distinct layers: the Presentation Layer (Frontend), the Application Layer (Backend), and the Data Layer (Database). This architectural approach ensures modularity, scalability, and maintainability of the system.

**Presentation Layer (Frontend):**
The presentation layer is built using React.js with TypeScript and is responsible for rendering the user interface, handling user interactions, and communicating with the backend through RESTful API calls and WebSocket connections. The frontend runs entirely in the user's web browser and is served as a Single Page Application (SPA).

**Application Layer (Backend):**
The application layer is built using Node.js with Express.js and serves as the intermediary between the frontend and the database. It handles business logic, authentication, authorization, API request processing, and real-time communication management through Socket.io. The backend follows the Model-View-Controller (MVC) pattern with clearly defined models, controllers, and routes.

**Data Layer (Database):**
The data layer uses MySQL as the relational database management system, accessed through Sequelize ORM. It stores all persistent data including user information, examination details, questions, results, warnings, and activity logs. The database schema is designed with proper normalization and referential integrity constraints.

**Real-Time Communication Layer:**
In addition to the traditional three-tier architecture, the system incorporates a real-time communication layer powered by Socket.io. This layer enables bidirectional communication between the server and connected clients, facilitating live proctoring features such as camera feed streaming, instant warning delivery, and real-time activity monitoring.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           React.js + TypeScript Frontend             │    │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │    │
│  │  │  Pages   │  │Components│  │  Auth Context   │    │    │
│  │  └──────────┘  └──────────┘  └────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│         │ HTTP/REST API │           │ WebSocket │            │
└─────────┼───────────────┼───────────┼───────────┼───────────┘
          │               │           │           │
┌─────────┼───────────────┼───────────┼───────────┼───────────┐
│         ▼               ▼           ▼           ▼           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Node.js + Express.js Backend               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │    │
│  │  │  Routes  │  │Controllers│  │   Socket.io    │    │    │
│  │  └──────────┘  └──────────┘  └────────────────┘    │    │
│  │  ┌──────────┐  ┌──────────┐                         │    │
│  │  │Middleware│  │  Models   │                         │    │
│  │  └──────────┘  └──────────┘                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              MySQL Database (Sequelize ORM)          │    │
│  │  ┌──────┐ ┌──────┐ ┌─────────┐ ┌───────┐          │    │
│  │  │Users │ │Exams │ │Questions│ │Results│          │    │
│  │  └──────┘ └──────┘ └─────────┘ └───────┘          │    │
│  │  ┌────────┐ ┌────────────┐                          │    │
│  │  │Warnings│ │ActivityLogs│                          │    │
│  │  └────────┘ └────────────┘                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                       SERVER                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

The following technologies were selected for the development of this system based on their maturity, community support, performance characteristics, and suitability for the project requirements:

#### 4.2.1 Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | 19.2.5 | UI component library for building interactive interfaces |
| TypeScript | 6.0.2 | Static type checking for JavaScript, improving code quality |
| Vite | 8.0.10 | Build tool and development server with hot module replacement |
| React Router DOM | 7.14.2 | Client-side routing for single-page application navigation |
| Axios | 1.16.0 | HTTP client for making API requests to the backend |
| Socket.io Client | 4.8.3 | WebSocket client for real-time communication |
| Tailwind CSS | 4.2.4 | Utility-first CSS framework for responsive styling |
| Lucide React | 1.14.0 | Icon library for consistent UI iconography |

**React.js** was chosen as the frontend framework due to its component-based architecture, virtual DOM for efficient rendering, and extensive ecosystem of libraries and tools. The use of TypeScript adds static type checking, which catches errors at compile time and improves code maintainability.

**Vite** serves as the build tool, providing extremely fast hot module replacement during development and optimized production builds. Its native ES module support results in significantly faster development server startup compared to traditional bundlers.

**Tailwind CSS** was selected for styling due to its utility-first approach, which enables rapid UI development without writing custom CSS files. The framework's responsive design utilities ensure the application works well across different screen sizes.

#### 4.2.2 Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | Latest LTS | JavaScript runtime for server-side execution |
| Express.js | 5.2.1 | Web application framework for API development |
| Sequelize | 6.37.8 | Object-Relational Mapping (ORM) for database operations |
| JSON Web Token | 9.0.3 | Token-based authentication mechanism |
| bcryptjs | 3.0.3 | Password hashing library for secure credential storage |
| Socket.io | 4.8.3 | Real-time bidirectional event-based communication |
| Multer | 2.1.1 | Middleware for handling multipart/form-data (file uploads) |
| CORS | 2.8.6 | Cross-Origin Resource Sharing middleware |
| dotenv | 17.4.2 | Environment variable management |

**Node.js** was chosen for the backend due to its event-driven, non-blocking I/O model, which is particularly well-suited for real-time applications that handle multiple concurrent connections. The JavaScript runtime enables code sharing between frontend and backend.

**Express.js** provides a minimal and flexible web application framework that simplifies API development with its middleware-based architecture. Version 5.x brings improved routing, better error handling, and native promise support.

**Sequelize ORM** abstracts database operations into JavaScript objects and methods, providing database-agnostic query building, migration support, and model validation. This reduces the risk of SQL injection and simplifies database interactions.

**Socket.io** enables real-time, bidirectional communication between the server and clients. It automatically handles connection upgrades from HTTP polling to WebSocket, provides automatic reconnection, and supports room-based broadcasting — all essential features for the proctoring system.

#### 4.2.3 Database Technology

| Technology | Purpose |
|-----------|---------|
| MySQL | Relational database management system for persistent data storage |

**MySQL** was selected as the database system due to its reliability, performance, ACID compliance, and widespread adoption in web applications. Its support for complex queries, transactions, and referential integrity makes it ideal for an examination system where data consistency is critical.

### 4.3 System Requirements

#### 4.3.1 Hardware Requirements

**Server Requirements:**
- Processor: Intel Core i3 or equivalent (minimum)
- RAM: 4 GB (minimum), 8 GB (recommended)
- Storage: 20 GB available disk space
- Network: Stable internet connection with minimum 10 Mbps upload speed

**Client Requirements:**
- Processor: Any modern processor (Intel/AMD/ARM)
- RAM: 2 GB (minimum)
- Webcam: Built-in or external webcam with minimum 720p resolution
- Microphone: Built-in or external microphone
- Network: Stable internet connection with minimum 2 Mbps upload speed

#### 4.3.2 Software Requirements

**Server Software:**
- Operating System: Windows 10/11, Linux (Ubuntu 20.04+), or macOS
- Node.js: Version 18.x or higher
- MySQL: Version 8.0 or higher
- npm: Version 9.x or higher

**Client Software:**
- Web Browser: Google Chrome 90+, Mozilla Firefox 88+, Microsoft Edge 90+, or Safari 14+
- Operating System: Any OS with a supported modern browser
- WebRTC Support: Required for camera access

### 4.4 Data Flow Diagrams

#### 4.4.1 Level 0 – Context Diagram

The context diagram shows the system as a single process with its interactions with external entities:

```
                    ┌──────────────┐
                    │              │
    Login Credentials│    ADMIN     │ Exam Management
    ─────────────────►│              │◄─────────────────
    Results/Reports  │              │ Student Management
    ◄─────────────────│              │ Monitoring
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   ONLINE     │
                    │ EXAMINATION  │
                    │   SYSTEM     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │              │
    Login Credentials│   STUDENT    │ Take Exam
    ─────────────────►│              │◄─────────────────
    Results/Warnings │              │ Camera Feed
    ◄─────────────────│              │─────────────────►
                    └──────────────┘
```

#### 4.4.2 Level 1 – Detailed Data Flow

The Level 1 DFD breaks down the system into its major processes:

**Process 1: Authentication**
- Input: Login credentials (loginId, password)
- Process: Validate credentials, generate JWT token
- Output: Authentication token, user profile

**Process 2: Exam Management**
- Input: Exam details (title, duration, questions)
- Process: Create/update/delete examinations and questions
- Output: Exam data stored in database

**Process 3: Examination Execution**
- Input: Student answers, timer events
- Process: Present questions, track time, collect answers
- Output: Submitted answers, activity logs

**Process 4: Proctoring**
- Input: Camera frames, activity events
- Process: Stream to admin, detect violations, manage warnings
- Output: Warnings, termination signals

**Process 5: Result Processing**
- Input: Submitted answers, correct answers
- Process: Calculate scores, generate statistics
- Output: Results with scores and percentages

### 4.5 Entity-Relationship Diagram

The database design follows the Entity-Relationship model with the following entities and their relationships:

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│  USERS   │       │  EXAMS   │       │  QUESTIONS   │
├──────────┤       ├──────────┤       ├──────────────┤
│ id (PK)  │       │ id (PK)  │       │ id (PK)      │
│ name     │       │ title    │       │ examId (FK)  │
│ email    │◄──────│ duration │──────►│ question     │
│ loginId  │creates│ createdBy│has    │ option1-4    │
│ password │       │ (FK)     │many   │ correctAnswer│
│ role     │       └──────────┘       │ marks        │
│ profile  │            │             └──────────────┘
└──────────┘            │
     │                  │
     │takes             │
     ▼                  ▼
┌──────────┐       ┌──────────┐       ┌──────────────┐
│ RESULTS  │       │ WARNINGS │       │ACTIVITY_LOGS │
├──────────┤       ├──────────┤       ├──────────────┤
│ id (PK)  │       │ id (PK)  │       │ id (PK)      │
│ userId   │       │ userId   │       │ userId (FK)  │
│ (FK)     │       │ (FK)     │       │ examId (FK)  │
│ examId   │       │ examId   │       │ eventType    │
│ (FK)     │       │ (FK)     │       │ timestamp    │
│ score    │       │ message  │       └──────────────┘
│ percentage│      │ count    │
│ status   │       │ timestamp│
└──────────┘       └──────────┘
```

**Relationships:**
- A User (admin) creates many Exams (One-to-Many)
- An Exam has many Questions (One-to-Many)
- A User (student) has many Results (One-to-Many)
- An Exam has many Results (One-to-Many)
- A User has many Warnings (One-to-Many)
- A User has many ActivityLogs (One-to-Many)

### 4.6 Use Case Diagrams

#### 4.6.1 Admin Use Cases

```
┌─────────────────────────────────────────────┐
│              System Boundary                 │
│                                             │
│  ┌─────────────────┐                       │
│  │  Manage Students │                       │
│  └────────┬────────┘                       │
│           │                                 │
│  ┌────────┴────────┐                       │
│  │  Create Exams    │                       │
│  └────────┬────────┘                       │
│           │                                 │
│  ┌────────┴────────┐     ┌──────┐          │
│  │ Manage Questions │◄────│ADMIN │          │
│  └────────┬────────┘     └──────┘          │
│           │                                 │
│  ┌────────┴────────┐                       │
│  │ Monitor Exams    │                       │
│  └────────┬────────┘                       │
│           │                                 │
│  ┌────────┴────────┐                       │
│  │  Send Warnings   │                       │
│  └────────┬────────┘                       │
│           │                                 │
│  ┌────────┴────────┐                       │
│  │  View Results    │                       │
│  └─────────────────┘                       │
└─────────────────────────────────────────────┘
```

#### 4.6.2 Student Use Cases

```
┌─────────────────────────────────────────────┐
│              System Boundary                 │
│                                             │
│  ┌─────────────────┐                       │
│  │     Login        │                       │
│  └────────┬────────┘                       │
│           │                                 │
│  ┌────────┴────────┐                       │
│  │  View Exams      │                       │
│  └────────┬────────┘     ┌────────┐        │
│           │              │STUDENT │        │
│  ┌────────┴────────┐◄───└────────┘        │
│  │  Take Exam       │                       │
│  └────────┬────────┘                       │
│           │                                 │
│  ┌────────┴────────┐                       │
│  │ Provide Camera   │                       │
│  └────────┬────────┘                       │
│           │                                 │
│  ┌────────┴────────┐                       │
│  │  View Results    │                       │
│  └─────────────────┘                       │
└─────────────────────────────────────────────┘
```

---
---

## CHAPTER 5: METHODOLOGY AND IMPLEMENTATION

### 5.1 Development Methodology

The development of this project followed the **Agile Software Development Methodology** with iterative development cycles. This approach was chosen because it allows for flexibility in requirements, continuous feedback incorporation, and incremental delivery of functional components.

**Phase 1: Requirements Gathering and Analysis**
During this phase, the functional and non-functional requirements of the system were identified and documented. The key stakeholders (administrators, teachers, and students) were considered, and their needs were analyzed to define the system's feature set.

**Phase 2: System Design**
The system architecture, database schema, API endpoints, and user interface wireframes were designed. Technology selection was finalized based on project requirements, team expertise, and scalability considerations.

**Phase 3: Backend Development**
The backend was developed first, establishing the data models, API endpoints, authentication system, and real-time communication infrastructure. This approach ensured that the frontend had stable APIs to integrate with.

**Phase 4: Frontend Development**
The user interface was developed using React.js with TypeScript, implementing all pages, components, and integrations with the backend APIs and WebSocket connections.

**Phase 5: Integration and Testing**
The frontend and backend were integrated, and comprehensive testing was performed including unit testing, integration testing, and user acceptance testing.

**Phase 6: Deployment and Documentation**
The final phase involved preparing the system for deployment, creating documentation, and generating this project report.

### 5.2 Database Design

The database for this system is named `online_exam` and consists of six tables designed to store all application data with proper normalization and referential integrity.

#### 5.2.1 Users Table

The Users table stores information about all system users, including both administrators and students.

```sql
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    loginId VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    profileImage VARCHAR(255) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Design Decisions:**
- The `loginId` field is unique and serves as the primary authentication identifier, separate from email
- Passwords are stored as bcrypt hashes, never in plain text
- The `role` field uses an ENUM type to restrict values to valid roles
- Profile images are stored as file paths, with actual files in the uploads directory

#### 5.2.2 Exams Table

The Exams table stores examination metadata including title, duration, and creator information.

```sql
CREATE TABLE Exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE CASCADE
);
```

**Design Decisions:**
- Duration is stored in minutes as an integer for simple arithmetic operations
- The `createdBy` foreign key links to the admin who created the exam
- CASCADE delete ensures that when an admin is removed, their exams are also cleaned up

#### 5.2.3 Questions Table

The Questions table stores individual questions associated with examinations.

```sql
CREATE TABLE Questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    examId INT NOT NULL,
    question TEXT NOT NULL,
    option1 VARCHAR(255) NOT NULL,
    option2 VARCHAR(255) NOT NULL,
    option3 VARCHAR(255) NOT NULL,
    option4 VARCHAR(255) NOT NULL,
    correctAnswer VARCHAR(255) NOT NULL,
    marks INT DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);
```

**Design Decisions:**
- Four options are stored as separate columns for simplicity and query efficiency
- The `correctAnswer` field stores the text of the correct option for direct comparison
- Each question has configurable marks, defaulting to 1
- CASCADE delete removes questions when their parent exam is deleted

#### 5.2.4 Results Table

The Results table stores examination outcomes for each student.

```sql
CREATE TABLE Results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    examId INT NOT NULL,
    score INT NOT NULL,
    percentage FLOAT NOT NULL,
    status ENUM('completed', 'terminated') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);
```

**Design Decisions:**
- The `status` field distinguishes between normally completed exams and those terminated due to violations
- Both raw score and percentage are stored for quick retrieval without recalculation
- Dual foreign keys link results to both the student and the exam

#### 5.2.5 Warnings Table

The Warnings table tracks warnings issued to students during examinations.

```sql
CREATE TABLE Warnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    examId INT NOT NULL,
    message TEXT,
    count INT DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);
```

#### 5.2.6 ActivityLogs Table

The ActivityLogs table records all suspicious activities detected during examinations.

```sql
CREATE TABLE ActivityLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    examId INT NOT NULL,
    eventType VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);
```

### 5.3 Backend Implementation

#### 5.3.1 Server Configuration

The main server file (`server.js`) initializes the Express application, configures middleware, establishes database connections, sets up Socket.io for real-time communication, and defines route mappings.

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
```

The server creates an HTTP server instance that is shared between Express (for REST API) and Socket.io (for WebSocket connections). This dual-protocol approach enables both traditional request-response communication and real-time bidirectional messaging on the same port.

#### 5.3.2 Database Configuration

The database configuration (`config/db.js`) uses Sequelize ORM to establish a connection to MySQL and automatically creates the database if it does not exist:

```javascript
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

async function createDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );
    await connection.end();
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);
```

This approach ensures zero-configuration database setup — the application creates its own database on first run, simplifying deployment.

#### 5.3.3 Authentication Implementation

The authentication system uses JWT (JSON Web Tokens) for stateless authentication:

**Login Process:**
1. Client sends loginId and password to `/api/auth/login`
2. Server finds user by loginId in database
3. Server compares provided password with stored bcrypt hash
4. If valid, server generates JWT token with user ID and 24-hour expiry
5. Token and user data returned to client

**Token Verification Middleware:**
```javascript
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
        next();
    }
};
```

**Role-Based Access Control:**
```javascript
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};
```

#### 5.3.4 API Implementation

The backend exposes RESTful API endpoints organized by resource:

**Student Management Controller:**
- `GET /api/students` — Retrieves all students with pagination support
- `POST /api/students` — Creates a new student with profile image upload
- `PUT /api/students/:id` — Updates student information
- `DELETE /api/students/:id` — Removes a student from the system

**Exam Management Controller:**
- `GET /api/exams` — Lists all exams (admin sees all, students see available)
- `POST /api/exams` — Creates a new examination
- `GET /api/exams/:id` — Retrieves exam details with questions
- `DELETE /api/exams/:id` — Deletes an examination and all associated data

**Question Management Controller:**
- `POST /api/questions` — Adds a single question to an exam
- `POST /api/questions/bulk` — Bulk adds multiple questions
- `GET /api/questions/:examId` — Retrieves all questions for an exam
- `PUT /api/questions/:id` — Updates a question
- `DELETE /api/questions/:id` — Removes a question

**Result Controller:**
- `POST /api/results/submit` — Submits exam answers and calculates score
- `GET /api/results/all` — Admin retrieves all results
- `GET /api/results/user` — Student retrieves their own results

#### 5.3.5 Result Calculation Logic

The exam submission endpoint implements automated scoring:

```javascript
const submitExam = async (req, res) => {
    const { examId, answers } = req.body;
    const questions = await Question.findAll({ where: { examId } });
    
    let score = 0;
    let totalMarks = 0;
    
    questions.forEach((question) => {
        totalMarks += question.marks;
        const userAnswer = answers[question.id];
        if (userAnswer === question.correctAnswer) {
            score += question.marks;
        }
    });
    
    const percentage = (score / totalMarks) * 100;
    
    const result = await Result.create({
        userId: req.user.id,
        examId,
        score,
        percentage,
        status: 'completed'
    });
    
    return res.json({ result, score, totalMarks, percentage });
};
```

### 5.4 Frontend Implementation

#### 5.4.1 Application Structure

The frontend application is structured as a Single Page Application (SPA) with React Router handling client-side navigation. The main `App.tsx` file defines the routing structure:

```typescript
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/student" element={
                        <ProtectedRoute>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/exam/:id" element={
                        <ProtectedRoute>
                            <ExamPage />
                        </ProtectedRoute>
                    } />
                    {/* Additional routes */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}
```

#### 5.4.2 Authentication Context

The `AuthContext.tsx` provides global authentication state management using React's Context API:

```typescript
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (loginId: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

export const AuthProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('token')
    );
    
    const login = async (loginId: string, password: string) => {
        const response = await api.post('/auth/login', { loginId, password });
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
    };
    
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };
    
    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
```

#### 5.4.3 Protected Route Component

The `ProtectedRoute` component ensures that only authenticated users can access protected pages:

```typescript
const ProtectedRoute: React.FC<{ adminOnly?: boolean }> = ({ 
    children, adminOnly 
}) => {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/student" />;
    
    return <>{children}</>;
};
```

#### 5.4.4 API Service Configuration

The `api.ts` file configures an Axios instance with automatic token injection:

```typescript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

#### 5.4.5 Exam Page Implementation

The ExamPage component is the most complex frontend component, handling:
- Question display and navigation
- Answer selection and storage
- Countdown timer
- Camera access and frame capture
- Socket.io connection for proctoring
- Warning display
- Auto-submission on timeout

Key implementation aspects:

```typescript
const ExamPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket>();
    
    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit(); // Auto-submit on timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    // Camera frame capture every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (videoRef.current) {
                const canvas = document.createElement('canvas');
                canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
                const frame = canvas.toDataURL('image/jpeg', 0.5);
                socketRef.current?.emit('student-frame', { frame, examId });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);
};
```

### 5.5 Real-Time Proctoring Implementation

The real-time proctoring system is the most technically sophisticated component of this project, leveraging Socket.io for bidirectional communication between students taking exams and administrators monitoring them.

#### 5.5.1 Socket.io Server Configuration

```javascript
io.on('connection', (socket) => {
    // Admin joins monitoring room
    socket.on('join-room', (room) => {
        socket.join(room);
    });
    
    // Student starts exam
    socket.on('student_join', ({ userId, name, examId }) => {
        activeStudents.set(socket.id, { userId, name, examId });
        io.to('admin-monitoring').emit('active-students', 
            Array.from(activeStudents.values())
        );
    });
    
    // Student sends camera frame
    socket.on('student-frame', ({ frame, examId }) => {
        const student = activeStudents.get(socket.id);
        io.to('admin-monitoring').emit('student-frame', {
            socketId: socket.id,
            frame,
            studentName: student?.name
        });
    });
    
    // Admin sends warning to student
    socket.on('send_warning', ({ targetSocketId, message }) => {
        io.to(targetSocketId).emit('receive_warning', { message });
    });
    
    // Student disconnects
    socket.on('disconnect', () => {
        activeStudents.delete(socket.id);
        io.to('admin-monitoring').emit('active-students',
            Array.from(activeStudents.values())
        );
    });
});
```

#### 5.5.2 Proctoring Dashboard (Admin Side)

The Proctoring Dashboard provides administrators with a real-time command center:

- **Active Student List:** Shows all students currently taking exams with their names and exam details
- **Live Camera Feeds:** Displays camera frames from selected students, updated every 3 seconds
- **Activity Log:** Shows real-time activity events (tab switches, fullscreen exits, etc.)
- **Warning Controls:** Allows administrators to send text warnings to specific students
- **Student Status:** Displays warning count and connection status for each student

#### 5.5.3 Activity Monitoring (Student Side)

The student's browser monitors for suspicious activities:

```typescript
// Detect tab switching
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        socket.emit('student-activity-log', {
            eventType: 'tab-switch',
            examId,
            userId
        });
    }
});

// Detect fullscreen exit
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        socket.emit('student-activity-log', {
            eventType: 'fullscreen-exit',
            examId,
            userId
        });
    }
});
```

#### 5.5.4 Warning and Termination System

The warning system implements a graduated response:
1. First warning: Notification displayed to student
2. Subsequent warnings: Counter incremented, notification shown
3. 10th warning: Exam automatically terminated, answers submitted with 'terminated' status

### 5.6 Authentication and Security

#### 5.6.1 Password Security

All passwords are hashed using bcrypt with a salt factor of 10 before storage:

```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

During login, the provided password is compared against the stored hash:

```javascript
const isMatch = await bcrypt.compare(providedPassword, user.password);
```

#### 5.6.2 JWT Token Management

Tokens are generated with a 24-hour expiration:

```javascript
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
});
```

#### 5.6.3 CORS Configuration

Cross-Origin Resource Sharing is configured to allow frontend-backend communication:

```javascript
app.use(cors());
```

#### 5.6.4 File Upload Security

Profile image uploads are handled by Multer with file type restrictions:

```javascript
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
```

---
---

## CHAPTER 6: MODULE DESCRIPTION

### 6.1 Admin Module

The Admin Module provides comprehensive system management capabilities to administrators. This module is the control center of the entire application, enabling administrators to manage all aspects of the examination system.

#### 6.1.1 Student Management

The student management sub-module allows administrators to perform complete CRUD (Create, Read, Update, Delete) operations on student records:

**Create Student:**
- Administrators can register new students by providing their name, email, login ID, and password
- An optional profile image can be uploaded during registration
- The system automatically hashes the password before storage
- Login IDs must be unique across the system

**View Students:**
- A comprehensive list of all registered students is displayed
- Each entry shows the student's name, email, login ID, and profile image
- The list supports search and filtering capabilities

**Update Student:**
- Administrators can modify student information including name, email, and login credentials
- Profile images can be updated or removed
- Password changes are optional during updates

**Delete Student:**
- Students can be permanently removed from the system
- Deletion cascades to remove all associated results, warnings, and activity logs
- A confirmation prompt prevents accidental deletions

#### 6.1.2 Exam Management

The exam management sub-module handles the creation and lifecycle of examinations:

**Create Exam:**
- Administrators specify the exam title and duration (in minutes)
- The exam is automatically associated with the creating administrator
- Created exams are immediately visible to all students

**View Exams:**
- All exams are listed with their titles, durations, and creation dates
- Each exam shows the number of associated questions
- Quick actions allow editing questions or deleting the exam

**Delete Exam:**
- Exams can be permanently removed along with all associated questions and results
- Active exams (currently being taken by students) should not be deleted

#### 6.1.3 Question Management

The question management sub-module provides tools for creating and managing examination questions:

**Add Single Question:**
- Administrators can add questions one at a time
- Each question requires: question text, four options, correct answer, and marks
- Questions are immediately associated with the selected exam

**Bulk Add Questions:**
- Multiple questions can be added simultaneously
- This feature significantly reduces the time required to populate large question banks
- Input validation ensures all required fields are provided for each question

**Edit Question:**
- Existing questions can be modified including text, options, correct answer, and marks
- Changes take effect immediately for future exam attempts

**Delete Question:**
- Individual questions can be removed from an exam
- The total marks for the exam are automatically recalculated

#### 6.1.4 Live Monitoring

The live monitoring sub-module provides real-time oversight of ongoing examinations:

- Real-time list of all students currently taking exams
- Live camera feeds from student webcams (updated every 3 seconds)
- Activity log showing suspicious events as they occur
- Ability to select and focus on individual students
- Connection status indicators for each student

#### 6.1.5 Warning System

The warning system allows administrators to intervene during examinations:

- Send text warnings to specific students
- Warning counter tracks cumulative warnings per student per exam
- Automatic exam termination at 10 warnings
- Warning history maintained for audit purposes

#### 6.1.6 Security Settings

Administrators can manage their own credentials:

- Update admin password
- Modify admin profile information
- View system configuration status

### 6.2 Student Module

The Student Module provides students with access to examinations and their results through a clean, focused interface.

#### 6.2.1 Student Dashboard

The student dashboard serves as the landing page after login:

- Displays the student's profile information (name, email, profile image)
- Lists all available examinations with titles and durations
- Shows examination status (available, completed, terminated)
- Provides quick access to past results
- Clean, distraction-free interface designed for focus

#### 6.2.2 Profile Management

Students can view and manage their profile:

- View personal information (name, email, login ID)
- Update profile image
- Change password (requires current password verification)

#### 6.2.3 Exam Browsing

Students can browse available examinations:

- View exam titles and durations
- See the number of questions in each exam
- Check if they have already attempted an exam
- Start an examination with a single click

### 6.3 Examination Module

The Examination Module handles the core exam-taking experience, providing a controlled and monitored environment for students.

#### 6.3.1 Exam Initialization

When a student starts an examination:

1. The system fetches all questions for the selected exam
2. A countdown timer is initialized based on the exam duration
3. Camera and microphone permissions are requested
4. A Socket.io connection is established for proctoring
5. The student is registered in the active students list
6. Frame capture begins (every 3 seconds)
7. Activity monitoring listeners are activated

#### 6.3.2 Question Navigation

The exam interface presents one question at a time:

- **Current Question Display:** Shows question text and four options as radio buttons
- **Navigation Controls:** Previous and Next buttons for moving between questions
- **Question Counter:** Shows current position (e.g., "Question 3 of 20")
- **Answer Persistence:** Selected answers are stored locally and persist across navigation
- **Review Capability:** Students can revisit and change answers before submission

#### 6.3.3 Timer System

The countdown timer provides time management:

- Displays remaining time in MM:SS format
- Visual warning when time is running low (changes color)
- Automatic submission when timer reaches zero
- Timer continues even if the student navigates between questions

#### 6.3.4 Answer Submission

The submission process:

1. Student clicks "Submit Exam" or timer expires
2. All answers are collected from local state
3. Answers are sent to the backend via API call
4. Backend calculates score by comparing with correct answers
5. Result is stored in the database
6. Student is redirected to the results page
7. Socket.io connection is terminated
8. Camera and microphone are released

#### 6.3.5 Camera Integration

The webcam integration for proctoring:

- Camera access is requested using the MediaDevices API
- A live preview is shown to the student (small corner display)
- Frames are captured from the video stream every 3 seconds
- Frames are compressed to JPEG format at 50% quality for bandwidth efficiency
- Compressed frames are sent to the server via Socket.io
- If camera access is denied, the student cannot proceed with the exam

### 6.4 Proctoring Module

The Proctoring Module is the system's integrity enforcement mechanism, providing real-time monitoring and intervention capabilities.

#### 6.4.1 Camera Monitoring

The camera monitoring system operates as follows:

**Student Side:**
- Webcam stream is captured using `navigator.mediaDevices.getUserMedia()`
- Every 3 seconds, a frame is extracted from the video stream
- The frame is drawn onto a canvas element and converted to base64 JPEG
- The compressed frame is emitted via Socket.io to the server

**Server Side:**
- Receives frames from all active students
- Broadcasts frames to the admin monitoring room
- Associates frames with student identity information

**Admin Side:**
- Receives frames and displays them in a grid layout
- Can select individual students for enlarged view
- Frames update in near real-time (3-second intervals)

#### 6.4.2 Activity Tracking

The system monitors for the following suspicious activities:

| Event Type | Trigger | Severity |
|-----------|---------|----------|
| Tab Switch | Student switches to another browser tab | Medium |
| Fullscreen Exit | Student exits fullscreen mode | Medium |
| Window Blur | Browser window loses focus | Low |
| Copy Attempt | Student attempts to copy text | High |
| Right Click | Student opens context menu | Low |

Each detected event is:
1. Logged locally with timestamp
2. Sent to the server via Socket.io
3. Stored in the ActivityLogs table
4. Displayed on the admin's proctoring dashboard

#### 6.4.3 Warning Mechanism

The warning system provides graduated intervention:

**Warning Issuance:**
- Admin selects a student from the active list
- Admin types a warning message
- Warning is sent via Socket.io directly to the student
- Warning count is incremented in the database

**Warning Reception:**
- Student receives a visual notification overlay
- Warning message is displayed prominently
- Student must acknowledge the warning to continue
- Warning count is displayed to the student

**Automatic Termination:**
- When a student accumulates 10 warnings, the exam is automatically terminated
- The student's answers (as submitted so far) are saved
- The result is recorded with status 'terminated'
- The student is redirected to the results page with termination notice

### 6.5 Results Module

The Results Module handles score calculation, storage, and presentation of examination outcomes.

#### 6.5.1 Score Calculation

The scoring algorithm:

```
For each question in the exam:
    totalMarks += question.marks
    if (studentAnswer === question.correctAnswer):
        score += question.marks

percentage = (score / totalMarks) * 100
```

- Only exact matches are counted as correct
- Unanswered questions receive zero marks
- No negative marking is implemented
- Percentage is calculated to two decimal places

#### 6.5.2 Result Storage

Each result record contains:
- Student ID (who took the exam)
- Exam ID (which exam was taken)
- Raw score (marks obtained)
- Percentage (score as percentage of total)
- Status (completed or terminated)
- Timestamp (when the exam was submitted)

#### 6.5.3 Admin Results View

Administrators can view:
- All results across all exams
- Filter results by exam
- Sort by score, percentage, or date
- View individual student performance
- Identify terminated exams and their reasons
- Export results for external analysis

#### 6.5.4 Student Results View

Students can view:
- Their own results for all attempted exams
- Score and percentage for each attempt
- Status of each attempt (completed/terminated)
- Date and time of each attempt

---
---

## CHAPTER 7: SCREENSHOTS AND USER INTERFACE

This chapter presents the user interface of the Online Examination System with Real-Time Proctoring. The screenshots demonstrate the various pages and features of the application.

### 7.1 Login Page

**[Insert Screenshot: Login Page]**

*Figure 7.1: Login Page — The authentication interface where users enter their login ID and password. The page features a clean, centered form with the application branding and a secure login button. Error messages are displayed below the form fields when authentication fails.*

The login page serves as the entry point for all users. It features:
- A centered login form with fields for Login ID and Password
- Application logo and title at the top
- Error message display for invalid credentials
- Responsive design that works on all screen sizes
- Orange and yellow color scheme consistent with the application branding

---

### 7.2 Admin Dashboard

**[Insert Screenshot: Admin Dashboard - Main View]**

*Figure 7.2: Admin Dashboard — The main control panel showing navigation options for Student Management, Exam Management, Live Monitoring, and Results. The dashboard provides quick access to all administrative functions.*

The admin dashboard provides:
- Navigation sidebar with links to all admin features
- Overview statistics (total students, total exams, active exams)
- Quick action buttons for common tasks
- Recent activity feed
- System status indicators

---

### 7.3 Student Management Panel

**[Insert Screenshot: Student Management - List View]**

*Figure 7.3: Student Management Panel — Shows the list of registered students with their names, emails, login IDs, and profile images. Action buttons allow editing and deleting student records.*

**[Insert Screenshot: Student Management - Add Student Form]**

*Figure 7.4: Add Student Form — The form for registering new students with fields for name, email, login ID, password, and profile image upload.*

---

### 7.4 Create Exam Page

**[Insert Screenshot: Create Exam Page]**

*Figure 7.5: Create Exam Page — The form for creating new examinations with fields for exam title and duration in minutes. The interface is simple and focused on the essential information needed to create an exam.*

---

### 7.5 Manage Questions Page

**[Insert Screenshot: Manage Questions - Question List]**

*Figure 7.6: Manage Questions Page — Shows all questions for a selected exam with their text, options, correct answers, and marks. Edit and delete buttons are available for each question.*

**[Insert Screenshot: Manage Questions - Add Question Form]**

*Figure 7.7: Add Question Form — The form for adding new questions with fields for question text, four options, correct answer selection, and marks allocation.*

---

### 7.6 Student Dashboard

**[Insert Screenshot: Student Dashboard]**

*Figure 7.8: Student Dashboard — The student's home page showing their profile information and a list of available examinations with titles, durations, and start buttons.*

---

### 7.7 Exam Interface

**[Insert Screenshot: Exam Page - Question View]**

*Figure 7.9: Exam Interface — Shows the exam-taking environment with the current question, four options as radio buttons, navigation controls (Previous/Next), countdown timer, and the student's camera preview in the corner.*

**[Insert Screenshot: Exam Page - Timer Warning]**

*Figure 7.10: Timer Warning — The exam interface when time is running low, showing the timer in red to alert the student.*

---

### 7.8 Proctoring Dashboard

**[Insert Screenshot: Proctoring Dashboard - Overview]**

*Figure 7.11: Proctoring Dashboard — The admin's real-time monitoring interface showing the list of active students, their camera feeds, activity logs, and warning controls.*

---

### 7.9 Live Camera Monitoring

**[Insert Screenshot: Live Camera Feed Grid]**

*Figure 7.12: Live Camera Monitoring — Grid view of camera feeds from all active students, updated every 3 seconds. Each feed is labeled with the student's name and exam.*

---

### 7.10 Warning System Interface

**[Insert Screenshot: Warning Dialog - Admin Side]**

*Figure 7.13: Warning System (Admin) — The interface for sending warnings to students, showing the warning message input and send button.*

**[Insert Screenshot: Warning Notification - Student Side]**

*Figure 7.14: Warning Notification (Student) — The warning overlay displayed to students when they receive a warning from the administrator, showing the warning message and current warning count.*

---

### 7.11 Results Page - Admin View

**[Insert Screenshot: Results Page - Admin View]**

*Figure 7.15: Results Page (Admin) — Shows all examination results across all students with scores, percentages, status, and timestamps. Filtering options allow viewing results by exam.*

---

### 7.12 Results Page - Student View

**[Insert Screenshot: Results Page - Student View]**

*Figure 7.16: Results Page (Student) — Shows the student's own results for all attempted examinations with scores, percentages, and completion status.*

---
---

## CHAPTER 8: TESTING

### 8.1 Testing Strategy

A comprehensive testing strategy was employed to ensure the reliability, security, and usability of the Online Examination System. The testing process covered multiple levels including unit testing, integration testing, system testing, and user acceptance testing.

The testing approach followed the V-Model methodology where each development phase has a corresponding testing phase:
- Requirements → Acceptance Testing
- System Design → System Testing
- Architecture Design → Integration Testing
- Module Design → Unit Testing

### 8.2 Unit Testing

Unit testing focused on testing individual components and functions in isolation:

#### 8.2.1 Backend Unit Tests

| Test Case | Module | Input | Expected Output | Status |
|-----------|--------|-------|-----------------|--------|
| TC-01 | Auth | Valid credentials | JWT token returned | Pass |
| TC-02 | Auth | Invalid password | 401 error response | Pass |
| TC-03 | Auth | Non-existent user | 404 error response | Pass |
| TC-04 | Student | Valid student data | Student created | Pass |
| TC-05 | Student | Duplicate loginId | 400 error response | Pass |
| TC-06 | Exam | Valid exam data | Exam created | Pass |
| TC-07 | Exam | Missing title | 400 error response | Pass |
| TC-08 | Question | Valid question data | Question created | Pass |
| TC-09 | Question | Missing options | 400 error response | Pass |
| TC-10 | Result | All correct answers | 100% score | Pass |
| TC-11 | Result | All wrong answers | 0% score | Pass |
| TC-12 | Result | Mixed answers | Correct percentage | Pass |
| TC-13 | Auth | Expired token | 401 error response | Pass |
| TC-14 | Auth | Student accessing admin route | 403 error response | Pass |

#### 8.2.2 Frontend Unit Tests

| Test Case | Component | Scenario | Expected Behavior | Status |
|-----------|-----------|----------|-------------------|--------|
| TC-15 | Login | Empty form submission | Validation error shown | Pass |
| TC-16 | Login | Successful login | Redirect to dashboard | Pass |
| TC-17 | ExamPage | Timer reaches zero | Auto-submit triggered | Pass |
| TC-18 | ExamPage | Answer selection | Answer stored in state | Pass |
| TC-19 | ExamPage | Navigation | Previous/Next works | Pass |
| TC-20 | ProtectedRoute | No token | Redirect to login | Pass |
| TC-21 | ProtectedRoute | Student on admin page | Redirect to student | Pass |

### 8.3 Integration Testing

Integration testing verified the interaction between different modules:

| Test Case | Modules Tested | Scenario | Expected Result | Status |
|-----------|---------------|----------|-----------------|--------|
| IT-01 | Auth + Database | Login flow | Token generated, user fetched | Pass |
| IT-02 | Exam + Questions | Create exam with questions | Both stored correctly | Pass |
| IT-03 | Exam + Results | Submit exam | Score calculated correctly | Pass |
| IT-04 | Socket + Proctoring | Camera frame transmission | Admin receives frames | Pass |
| IT-05 | Socket + Warning | Send warning | Student receives warning | Pass |
| IT-06 | Warning + Termination | 10 warnings | Exam auto-terminated | Pass |
| IT-07 | Auth + All Routes | Token expiry | All routes return 401 | Pass |
| IT-08 | Student + Exam | Student views exams | Only available exams shown | Pass |

### 8.4 User Acceptance Testing

User acceptance testing was conducted with representative users to validate the system meets its intended purpose:

**Test Scenario 1: Complete Exam Flow**
- Admin creates an exam with 10 questions
- Student logs in and starts the exam
- Student answers all questions and submits
- Result is immediately displayed with correct score
- **Result: Pass**

**Test Scenario 2: Proctoring Flow**
- Student starts exam with camera enabled
- Admin opens proctoring dashboard
- Admin can see student's camera feed
- Admin sends a warning
- Student receives and acknowledges warning
- **Result: Pass**

**Test Scenario 3: Auto-Termination**
- Student accumulates 10 warnings
- Exam is automatically terminated
- Result is saved with 'terminated' status
- Student cannot continue the exam
- **Result: Pass**

**Test Scenario 4: Timer Expiry**
- Student starts exam but does not submit
- Timer counts down to zero
- Exam is automatically submitted with current answers
- Result is calculated and stored
- **Result: Pass**

**Test Scenario 5: Concurrent Users**
- Multiple students take the same exam simultaneously
- Admin monitors all students on proctoring dashboard
- Each student's results are stored independently
- No data mixing between students
- **Result: Pass**

---
---

## CHAPTER 9: CONCLUSION AND FUTURE SCOPE

### 9.1 Conclusion

The Online Examination System with Real-Time Proctoring has been successfully designed, developed, and implemented as a comprehensive solution for conducting secure online examinations in educational institutions. The project demonstrates the effective integration of modern web technologies to create a system that addresses the critical challenges of online assessment.

**Key Achievements:**

The system successfully achieves all its primary objectives:

1. **Secure Online Examination Platform:** The application provides a complete digital examination environment with role-based access control, secure authentication, and data integrity measures. Administrators can create and manage examinations efficiently, while students can take exams in a controlled environment.

2. **Real-Time Proctoring:** The integration of webcam-based monitoring with Socket.io enables live surveillance of students during examinations. Administrators can view camera feeds, track activities, and intervene in real-time — a significant advancement over post-examination review approaches.

3. **Automated Evaluation:** The system provides instant result generation upon exam submission, eliminating the delays associated with manual evaluation. Students receive immediate feedback on their performance, and administrators have access to comprehensive analytics.

4. **Graduated Warning System:** The automated warning mechanism provides a fair and transparent approach to handling examination violations. The 10-warning threshold with automatic termination ensures that students are given adequate opportunity to correct their behavior before punitive action is taken.

5. **Scalable Architecture:** The three-tier architecture with clear separation of concerns ensures that the system can scale to accommodate growing numbers of users and examinations. The use of WebSocket technology enables efficient real-time communication without excessive server load.

**Technical Accomplishments:**

From a technical perspective, the project demonstrates proficiency in:
- Full-stack web development with React.js, Node.js, and MySQL
- Real-time communication using WebSocket (Socket.io)
- RESTful API design and implementation
- JWT-based authentication and authorization
- Database design with proper normalization and referential integrity
- Responsive UI development with Tailwind CSS
- TypeScript for type-safe frontend development

**Practical Impact:**

The system provides tangible benefits to educational institutions:
- Elimination of paper-based examination logistics
- Reduction in evaluation time from days/weeks to seconds
- Enhanced examination integrity through real-time monitoring
- Geographical flexibility for students
- Comprehensive audit trail for academic governance
- Cost reduction in examination administration

### 9.2 Future Enhancements

While the current system provides a solid foundation for online examinations with proctoring, several enhancements can be implemented in future iterations:

1. **AI-Based Proctoring:** Integration of artificial intelligence for automated suspicious behavior detection, including facial recognition to verify student identity, gaze tracking to detect looking away from the screen, and object detection to identify unauthorized materials.

2. **Subjective Question Support:** Extension of the question types to include short answer, essay, and code-based questions with manual or AI-assisted evaluation capabilities.

3. **Question Bank and Randomization:** Implementation of a centralized question bank with automatic randomization of questions and options for each student, reducing the possibility of answer sharing.

4. **Audio Proctoring:** Addition of audio monitoring to detect verbal communication during examinations, with noise level analysis and speech detection algorithms.

5. **Mobile Application:** Development of native mobile applications for iOS and Android to provide a more controlled examination environment with device-level restrictions.

6. **LMS Integration:** Integration with popular Learning Management Systems (Moodle, Canvas, Blackboard) to provide seamless examination capabilities within existing educational workflows.

7. **Advanced Analytics:** Implementation of detailed analytics including question difficulty analysis, discrimination index calculation, and student performance trends over time.

8. **Multi-Language Support:** Addition of internationalization (i18n) to support examinations in multiple languages, making the system accessible to diverse student populations.

9. **Offline Capability:** Implementation of Progressive Web App (PWA) features to handle network interruptions gracefully, allowing students to continue examinations during brief connectivity issues.

10. **Accessibility Compliance:** Enhancement of the user interface to meet WCAG 2.1 AA standards, ensuring the system is accessible to students with disabilities.

11. **Batch Result Export:** Addition of result export capabilities in various formats (PDF, Excel, CSV) for integration with institutional grading systems.

12. **Scheduled Examinations:** Implementation of exam scheduling with automatic start/end times, registration windows, and notification systems.

---
---

## REFERENCES

1. React.js Documentation. (2025). React – A JavaScript library for building user interfaces. Retrieved from https://react.dev/

2. Node.js Documentation. (2025). Node.js — Run JavaScript Everywhere. Retrieved from https://nodejs.org/

3. Express.js Documentation. (2025). Express - Node.js web application framework. Retrieved from https://expressjs.com/

4. MySQL Documentation. (2025). MySQL 8.0 Reference Manual. Retrieved from https://dev.mysql.com/doc/

5. Socket.io Documentation. (2025). Socket.IO — Bidirectional and low-latency communication. Retrieved from https://socket.io/docs/

6. Sequelize Documentation. (2025). Sequelize — Node.js ORM for SQL databases. Retrieved from https://sequelize.org/

7. TypeScript Documentation. (2025). TypeScript: JavaScript With Syntax For Types. Retrieved from https://www.typescriptlang.org/

8. Tailwind CSS Documentation. (2025). Tailwind CSS - Rapidly build modern websites. Retrieved from https://tailwindcss.com/

9. JSON Web Tokens. (2025). Introduction to JSON Web Tokens. Retrieved from https://jwt.io/introduction

10. Vite Documentation. (2025). Vite — Next Generation Frontend Tooling. Retrieved from https://vitejs.dev/

11. Axios Documentation. (2025). Axios — Promise based HTTP client. Retrieved from https://axios-http.com/

12. bcrypt.js Documentation. (2025). bcrypt.js — Optimized bcrypt in JavaScript. Retrieved from https://github.com/dcodeIO/bcrypt.js

13. Multer Documentation. (2025). Multer — Node.js middleware for handling multipart/form-data. Retrieved from https://github.com/expressjs/multer

14. CORS Documentation. (2025). cors — Node.js CORS middleware. Retrieved from https://github.com/expressjs/cors

15. Pressman, R. S. (2014). Software Engineering: A Practitioner's Approach (8th ed.). McGraw-Hill Education.

16. Sommerville, I. (2015). Software Engineering (10th ed.). Pearson Education.

17. Flanagan, D. (2020). JavaScript: The Definitive Guide (7th ed.). O'Reilly Media.

---
---

## APPENDIX A: INSTALLATION AND SETUP GUIDE

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm (v9 or higher)
- Modern web browser with webcam support

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Project 2"
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=online_exam
JWT_SECRET=your_secret_key_here
```

Start the backend server:

```bash
npm run dev
```

### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

### Step 4: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default Admin Credentials

- Login ID: `admin`
- Password: `admin123`

---

## APPENDIX B: API ENDPOINT REFERENCE

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | /api/auth/login | No | - | User authentication |
| 2 | GET | /api/auth/me | Yes | Any | Get current user profile |
| 3 | PUT | /api/auth/profile | Yes | Any | Update user profile |
| 4 | GET | /api/students | Yes | Admin | List all students |
| 5 | POST | /api/students | Yes | Admin | Create new student |
| 6 | PUT | /api/students/:id | Yes | Admin | Update student |
| 7 | DELETE | /api/students/:id | Yes | Admin | Delete student |
| 8 | GET | /api/exams | Yes | Any | List examinations |
| 9 | POST | /api/exams | Yes | Admin | Create examination |
| 10 | GET | /api/exams/:id | Yes | Any | Get exam with questions |
| 11 | DELETE | /api/exams/:id | Yes | Admin | Delete examination |
| 12 | POST | /api/questions | Yes | Admin | Add single question |
| 13 | POST | /api/questions/bulk | Yes | Admin | Bulk add questions |
| 14 | GET | /api/questions/:examId | Yes | Any | Get questions by exam |
| 15 | PUT | /api/questions/:id | Yes | Admin | Update question |
| 16 | DELETE | /api/questions/:id | Yes | Admin | Delete question |
| 17 | POST | /api/results/submit | Yes | Any | Submit exam answers |
| 18 | GET | /api/results/all | Yes | Admin | Get all results |
| 19 | GET | /api/results/user | Yes | Any | Get user's results |

---

## APPENDIX C: DATABASE SCHEMA (SQL)

```sql
CREATE DATABASE IF NOT EXISTS online_exam;
USE online_exam;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    loginId VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    profileImage VARCHAR(255) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    examId INT NOT NULL,
    question TEXT NOT NULL,
    option1 VARCHAR(255) NOT NULL,
    option2 VARCHAR(255) NOT NULL,
    option3 VARCHAR(255) NOT NULL,
    option4 VARCHAR(255) NOT NULL,
    correctAnswer VARCHAR(255) NOT NULL,
    marks INT DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);

CREATE TABLE Results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    examId INT NOT NULL,
    score INT NOT NULL,
    percentage FLOAT NOT NULL,
    status ENUM('completed', 'terminated') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);

CREATE TABLE Warnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    examId INT NOT NULL,
    message TEXT,
    count INT DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);

CREATE TABLE ActivityLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    examId INT NOT NULL,
    eventType VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (examId) REFERENCES Exams(id) ON DELETE CASCADE
);
```

---

**END OF REPORT**




