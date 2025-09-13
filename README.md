
---

## ✨ Features
- **User authentication** with Access & Refresh tokens
- **Password hashing** using Sequelize model hooks (bcrypt)
- **Forgot/Reset password flow** with token validation
- **Role-based access control** (e.g., `User`, `Admin`, `SuperAdmin`)
- **Super Admin bootstrap** (auto-created if not existing)
- **Redis for refresh token storage/blacklisting**
- **Secure .env-based configuration**
- **Email service module** (for password reset links)

---

## 📦 Tech Stack
- **Node.js** (Express.js)
- **PostgreSQL** (via Sequelize ORM)
- **Redis** (session & refresh token management)
- **JWT** (stateless authentication)
- **Nodemailer** (email service for reset-password flow)

---


