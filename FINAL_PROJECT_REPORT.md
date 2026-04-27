# Health Insurance Claim Processing System - Final Report

## 1. Project Overview
A production-ready full-stack system for managing health insurance claims, supporting both **Reimbursement** and **Cashless** workflows. The system caters to four distinct roles: Customers, Hospitals, TPAs (Third Party Administrators), and Admins.

## 2. Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, TanStack Query, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.
- **Storage**: Cloudinary/S3 (Simulation).

## 3. System Architecture
The application follows a standard three-tier architecture:
- **Presentation Layer**: Responsive React dashboard with role-based access control.
- **Business Logic Layer**: Node.js/Express REST API implementing claim state machines and RBAC.
- **Data Layer**: PostgreSQL managed via Prisma for type-safe database interactions.

## 4. Key Features
- [✓] **Unified Login**: Role-based redirection and permissions.
- [✓] **Claim State Machine**: Robust transitions (DRAFT → SUBMITTED → UNDER_REVIEW → NEED_MORE_INFO → APPROVED/REJECTED → SETTLED).
- [✓] **Multi-Role Dashboards**:
  - **Customer**: View policies, submit reimbursement claims, track status.
  - **Hospital**: Initiate cashless pre-auth requests.
  - **TPA**: Review claim queue, add comments, request more info.
  - **Admin**: Final approval, payment settlement records, system analytics.
- [✓] **Premium UI**: Modern aesthetics with glassmorphism, smooth animations, and optimized typography.
- [✓] **Audit Trail**: Every status change is logged with reviewer details and comments.

## 5. Database Schema
- **User**: Identity and role management.
- **Policy**: Coverage details linked to customers.
- **Hospital**: Network hospital registry.
- **Claim**: Central entity for medical claims.
- **Document**: Supporting evidence (bills, reports).
- **ClaimReview**: History of decisions and comments.
- **Payment**: Financial settlement records.

## 6. How to Run
### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` with your `DATABASE_URL`.
4. `npx prisma db push` (to sync schema).
5. `node src/utils/seed.js` (to seed test users).
6. `npm start` (or `node src/index.js`).

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---
**Author**: Antigravity (AI Assistant)
**Version**: 2.0 (New Stack Implementation)
