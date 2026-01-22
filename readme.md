# MUHSPS - School Management System

MUHSPS is a comprehensive, web-based School Management System designed to streamline the admission process, student management, and academic administration. It features distinct portals for Administrators, Teachers, and Students, facilitating a seamless workflow from online application to classroom management.

## 🚀 Key Features

1. 🌍 Public Portal & Admissions
- Responsive Landing Page: Modern UI with Bootstrap 5.
- Online Admission Form: Multi-step application wizard.
- Document Uploads: Secure upload for 7+ required documents (CNIC, Domicile, Photos, etc.) using Multer.
- Duplicate Prevention: Prevents multiple registrations with the same email.

2. 🛡️ Admin Dashboard
- Application Lifecycle Management:
- View Docs: Preview uploaded student documents in a modal.
- Verify: Approve documents and request fee payment.
- Object: Raise objections (e.g., "Blurry Image") which the student sees instantly.
- Reject/Delete: Reject applications with reasons or permanently delete records.
- Confirm: Finalize admission and assign GR Numbers.
- Stats & Overview: Real-time counters for Total Students, Teachers, and Pending Applications.
- Faculty & Class Management: (UI Demo) Interfaces for managing class structures and teacher profiles.

3. 🎓 Student Dashboard
- Smart State Handling:
- Applicant Mode: Tracks admission status (Pending → Objected → Verified → Fee Paid). Allows uploading of paid fee challans.
- Student Mode: Automatically unlocks once admission is "Confirmed".
- Academic Features: View Schedule, Courses, Attendance History, and Teacher Feedback.

4. 👨‍🏫 Teacher Dashboard
- Class Management: Overview of assigned classes and student counts.
- Attendance System: Digital calendar and roster interface for marking daily attendance.
- Feedback System: Form to submit annual behavioral and academic reports for students.

## 🛠️ Tech Stack
- Frontend: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (SPA architecture for dashboards).
- Backend: Node.js, Express.js.
- Database: MongoDB (Atlas Cloud).
- File Storage: Local Server Storage (uploads/ directory) via Multer.