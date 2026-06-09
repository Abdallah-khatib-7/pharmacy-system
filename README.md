# 💊 PharmaCare — Pharmacy Management System

<div align="center">

![PharmaCare Banner](https://img.shields.io/badge/PharmaCare-Pharmacy%20Management%20System-2563eb?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMTIgMjJDNi40NzcgMjIgMiAxNy41MjMgMiAxMlM2LjQ3NyAyIDEyIDJzMTAgNC40NzcgMTAgMTAtNC40NzcgMTAtMTAgMTB6Ii8+PHBhdGggZD0iTTkgMTJoNk05IDhoNiIvPjwvc3ZnPg==)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991?style=flat-square&logo=openai)](https://openai.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)

**A complete, production-ready pharmacy management system built by a pharmacist, for pharmacists.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Screenshots](#-screenshots)

</div>

---

## 🏥 About

PharmaCare is a **closed, professional pharmacy management system** built from 5 years of real pharmacy experience. It handles everything from inventory management to AI-powered drug consultations — designed around the actual daily workflow of a Lebanese pharmacy.

> **Access is restricted to authorized pharmacy staff only.** The pharmacy owner registers as Admin and creates accounts for their pharmacists. No public registration.

---

## ✨ Features

### 💊 Inventory Management
- Track medications by **brand name** and **active ingredient**
- Link multiple brands under one generic (e.g., Profinal, Advil, Brufen → all under Ibuprofen)
- Search any medication by active ingredient to find all available alternatives
- Track **purchase price** and **selling price** in USD
- Link each medication to a specific **supplier**

### 📋 Prescriptions
- Full prescription creation with patient name, doctor, diagnosis, prescription date
- Support for **multiple medications** per prescription with individual instructions
- **Insurance coverage calculation** — enter company name and coverage % to auto-calculate patient's share
- **Hospitalized patient** flag
- Automatic **stock deduction** when prescription is marked as dispensed
- Stock validation — cannot dispense if medication is out of stock
- Full prescription history with complete details

### 🏭 Supplier Management
- Manage supplier contact information
- View all medications supplied by each supplier
- Full **order history** per supplier

### 📦 Orders & Purchase Entry
- Create purchase orders linked to specific suppliers
- Orders only show medications from the selected supplier
- **Purchase Entry flow** — when an order arrives, verify each item's quantity and expiry date before confirming
- **Automatic stock increment** when order is marked as received
- Order status tracking: Pending → Processing → Received / Cancelled

### 🔔 Smart Alerts
- **Low stock alerts** — medications at or below 15 units, color-coded by severity
- **Expiry alerts** — medications expiring within 90 days, with days remaining
- Filter alerts by supplier, ingredient, stock level, or expiry urgency
- **Dismiss alerts** for 3, 7, 14, or 30 days
- **Export to PDF** — filter by supplier and download a report to send directly to your rep

### 🧪 Active Ingredients Search
- Browse all active ingredients
- Click any ingredient to see every brand available in your inventory
- Shows stock, expiry, form, dosage, and supplier for each brand

### 🤖 PharmaCare AI
- Powered by **OpenAI GPT-3.5** with live inventory context
- Knows your exact stock, prices, expiry dates, and suppliers
- Recommends **FEFO** (First Expiry, First Out) automatically
- Professional responses — no "consult a doctor" disclaimers
- Session-based memory — each conversation starts fresh

### 🧮 Dosage Calculator
- Weight-based dosage calculation (mg/kg/day)
- Automatic volume calculation for liquid medications (syrup, drops)
- Supports **renal impairment** adjustments (mild, moderate, severe)
- **Pediatric flag** for patients under 18
- **Pregnancy warning** flag
- Shows calculation steps transparently
- **FEFO alert** if selected medication is expiring soon
- Total course dose and volume calculation

### 👥 User Management (Admin Only)
- Create and manage pharmacist accounts
- View detailed performance analytics per pharmacist:
  - Total prescriptions, dispensed, cancelled, pending
  - Unique patients served
  - Revenue generated
  - Insured and hospitalized patient counts
  - Activity sparkline for last 30 days
  - Most prescribed medications with bar charts
  - Recent prescription history
- Sort pharmacists by prescriptions, revenue, dispensing rate

### 🔐 Authentication & Security
- **JWT-based authentication** with 24-hour token expiry
- **Role-based access control** — Admin vs Pharmacist
- Passwords hashed with **bcrypt** (10 salt rounds)
- Protected routes — unauthorized access redirects to landing
- Token stored in localStorage, user data persisted on refresh

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 (Vite) | UI framework |
| Tailwind CSS v4 | Styling |
| Lucide React | Icons |
| React Router v6 | Client-side routing |
| Axios | HTTP client with auto token injection |
| jsPDF + AutoTable | PDF export |
| Context API | Global auth state |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MySQL2 | Database driver |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| OpenAI SDK | AI assistant |
| dotenv | Environment configuration |
| nodemon | Development auto-reload |
| cors | Cross-origin requests |

### Database
| Table | Purpose |
|---|---|
| `users` | Pharmacists and admins |
| `active_ingredients` | Generic drug names |
| `medications` | Brand medications with prices |
| `suppliers` | Supplier information |
| `prescriptions` | Patient prescriptions |
| `prescription_items` | Individual medications per prescription |
| `orders` | Purchase orders |
| `order_items` | Individual items per order |
| `dismissed_alerts` | User-dismissed alert records |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL (via XAMPP or standalone)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Abdallah-khatib-7/pharmacy-system.git
cd pharmacy-system
```

### 2. Set up the database
```bash
# Start MySQL, then run:
mysql -u root -p < backend/database/init.sql
mysql -u root -p < backend/database/seed.sql
```

### 3. Configure the backend
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pharmacy
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_api_key
```

### 4. Install and run the backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 5. Install and run the frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 6. Create your admin account
Use Postman or any HTTP client:
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "admin@pharmacy.com",
  "password": "yourpassword",
  "role": "admin"
}
```

---

## 📁 Project Structure

```
pharmacy-system/
├── backend/
│   ├── database/
│   │   ├── init.sql          # Database schema
│   │   └── seed.sql          # Sample data (57 medications, 20 ingredients)
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js           # Register, login
│   │   ├── medications.js    # CRUD + alerts
│   │   ├── ingredients.js    # CRUD + ingredient search
│   │   ├── suppliers.js      # CRUD
│   │   ├── prescriptions.js  # CRUD + stock deduction
│   │   ├── orders.js         # CRUD + purchase entry + stock update
│   │   ├── alerts.js         # Low stock + expiry + dismiss
│   │   ├── users.js          # Pharmacist management + analytics
│   │   └── ai.js             # OpenAI integration with live inventory
│   ├── database.js           # Shared MySQL connection
│   ├── index.js              # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Auto token injection
    │   ├── components/
    │   │   ├── Layout.jsx         # Sidebar + topbar
    │   │   └── ProtectedRoute.jsx # Auth guard
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Auth provider
    │   │   └── useAuth.js        # Auth hook
    │   └── pages/
    │       ├── Landing.jsx        # Public landing page
    │       ├── Login.jsx          # Staff login
    │       ├── AdminDashboard.jsx
    │       ├── PharmacistDashboard.jsx
    │       ├── Medications.jsx
    │       ├── Ingredients.jsx
    │       ├── Suppliers.jsx
    │       ├── Orders.jsx
    │       ├── PurchaseEntry.jsx
    │       ├── Prescriptions.jsx
    │       ├── NewPrescription.jsx
    │       ├── Alerts.jsx
    │       ├── Users.jsx
    │       ├── PharmacareAI.jsx
    │       └── DosageCalculator.jsx
    └── package.json
```

---

## 📡 API Reference

### Authentication
```
POST   /api/auth/register          Register a new user
POST   /api/auth/login             Login and receive JWT token
```

### Medications
```
GET    /api/medications                    Get all medications
POST   /api/medications                    Add medication
PUT    /api/medications/:id                Update medication
DELETE /api/medications/:id                Delete medication
GET    /api/medications/alerts/low-stock   Get low stock alerts (≤15 units)
GET    /api/medications/alerts/expiring-soon  Get expiring medications (≤90 days)
```

### Active Ingredients
```
GET    /api/ingredients                    Get all ingredients
POST   /api/ingredients                    Add ingredient
GET    /api/ingredients/search?name=       Search by name
GET    /api/ingredients/:id/medications    Get all brands for ingredient
```

### Suppliers
```
GET    /api/suppliers              Get all suppliers
POST   /api/suppliers              Add supplier
PUT    /api/suppliers/:id          Update supplier
DELETE /api/suppliers/:id          Delete supplier
```

### Prescriptions
```
GET    /api/prescriptions              Get all prescriptions
POST   /api/prescriptions             Create prescription (validates stock)
PUT    /api/prescriptions/:id/status  Update status (deducts stock on dispensed)
```

### Orders
```
GET    /api/orders                     Get all orders
GET    /api/orders/:id                 Get order with items
POST   /api/orders                     Create order
PUT    /api/orders/:id/status          Update status (increments stock on received)
PUT    /api/orders/:id/items           Update items during purchase entry
GET    /api/orders/supplier/:id        Get orders by supplier
```

### Alerts
```
GET    /api/alerts/low-stock       Low stock (excludes dismissed)
GET    /api/alerts/expiring        Expiring soon (excludes dismissed)
POST   /api/alerts/dismiss         Dismiss alert for N days
```

### Users (Admin Only)
```
GET    /api/users                  Get all pharmacists with stats
GET    /api/users/:id/profile      Get detailed pharmacist profile
POST   /api/users                  Create pharmacist account
DELETE /api/users/:id              Remove pharmacist
```

### AI
```
POST   /api/ai/chat                Send message to PharmaCare AI
```

---

## 🔒 Security

- All routes except `/api/auth/*` require a valid JWT token
- Admin-only routes verified server-side via middleware
- Passwords never stored in plain text — bcrypt hashed
- API keys and database credentials stored in `.env` — never committed to Git
- SQL injection prevented via parameterized queries (`?` placeholders)
- CORS configured for frontend origin only

---

## 💡 Key Business Logic

| Feature | Logic |
|---|---|
| **Stock Deduction** | When prescription → `dispensed`, stock decreases by prescribed quantity |
| **Stock Increment** | When order → `received`, stock increases by ordered quantity |
| **Stock Validation** | Cannot create prescription if medication stock = 0 |
| **FEFO** | AI always recommends selling nearest-expiry batch first |
| **Insurance** | Patient pays = Total × (1 - coverage%) |
| **Dosage Calculation** | Volume = (Weight × Dose per kg ÷ Frequency) ÷ Concentration × Volume |
| **Alert Dismissal** | Per-user, time-based — alert returns after dismiss period |

---

## 👨‍💻 About the Developer

Built by **Abdallah Khatib** — a Computer Science graduate from Lebanese International University with 5+ years of real pharmacy experience. This project bridges both worlds: deep pharmacy domain knowledge with modern full-stack development.

- 💼 [LinkedIn](https://linkedin.com/in/abdallah-khatib-8b0499349)
- 🐙 [GitHub](https://github.com/Abdallah-khatib-7)
- 📧 abdallah.khatib2003@gmail.com

---

## 📄 License

This project is for portfolio and demonstration purposes.

---

<div align="center">
Built with ❤️ for Lebanese pharmacies
</div>
