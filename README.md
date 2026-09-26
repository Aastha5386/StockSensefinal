# 📦 StockSense: Next-Gen Inventory & Freight Management

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) 
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) 
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) 
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

**StockSense** is a centralized, real-time inventory and freight management platform built for speed, security, and scalability. Designed to bridge the gap between complex logistical operations and intuitive user experiences, StockSense provides a robust archival tally ledger, seamless dispatch systems, and instant discrepancy reconciliation.

---

## ✨ Key Features

- 🔐 **Multi-Provider Authentication**: Secure login via Email/Password, Google OAuth, and Phone Number (OTP/SMS) using Firebase Auth.
- 🛡️ **Role-Based Access Control (RBAC)**: Strict permission gating powered by Firestore Security Rules. 
  - **Admins** have full operational control and user management capabilities.
  - **Warehouse Staff** are sandboxed to their specific daily receipt and transfer tasks.
- ⚡ **Real-Time Data Sync**: Powered by Firebase Firestore, ensuring that inventory ledgers, stock receipts, and transfer histories are updated across all clients instantly.
- 🎨 **Premium UI/UX Design**: Built with Tailwind CSS, featuring a polished, responsive layout, fluid micro-animations, customizable dark/light modes, and intuitive navigation rails.
- ☁️ **Serverless Architecture**: Utilizes Firebase Cloud Functions for backend logic and Vercel for lightning-fast frontend delivery.

---

## 🛠️ Technology Stack

### Frontend Architecture
- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) for blazing-fast HMR and optimized production builds.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for strict type safety and scalable codebases.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first, highly customizable, and responsive design components.
- **Icons**: Google Material Symbols.

### Backend & Infrastructure
- **Authentication**: Firebase Auth (Google, Phone OTP, Email).
- **Database**: Cloud Firestore (NoSQL Document Database).
- **Backend Logic**: Firebase Cloud Functions (Node.js).
- **Hosting & CI/CD**: Deployed globally via [Vercel](https://vercel.com).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and npm installed.

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/smurtiranikhadanga/odoo-lpu-hackathon-2026.git
   cd odoo-lpu-hackathon-2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory based on `.env.example` and add your Firebase configuration keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The app will be running at `http://localhost:5173`.*

---

## 🔒 Security & RBAC Implementation
StockSense utilizes strict Firestore security rules to protect business data. 
- **User Verification**: Only authenticated users can read/write data.
- **Role Validation**: Destructive actions and user-management endpoints validate against the user's explicit role (`admin` vs `warehouse_staff`) stored securely in their Firestore profile document.

---

## 🏆 Hackathon Details
Built for the **Odoo Hackathon**. 
StockSense aims to revolutionize the way small and medium enterprises handle their freight ledgers by providing enterprise-grade tools in an accessible, open-source package.

---

## 👥 Meet the Team
- **Sandeep** – Team Leader (DevOps / Integrator)
- **Smurtirani Khadanga** – Frontend Developer & UI/UX Designer
- **Aastha Singh** – Backend Developer
