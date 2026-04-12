# 📚 LearnCrib

**Book a Tutor! Build a Future!**

LearnCrib is a mobile-first web application that connects students with verified expert tutors across Nigeria. Whether you need help with JAMB, WAEC, or university prep, LearnCrib makes it easy to find, book, and learn from qualified tutors — online or at home.

---

## ✨ Features

- **🔍 Tutor Discovery** — Search and browse verified tutors by subject, rating, and availability
- **📅 Session Booking** — Book one-on-one sessions with flexible scheduling
- **💬 In-App Messaging** — Communicate directly with tutors before and after sessions
- **💳 Secure Payments** — Integrated payment flow for hassle-free transactions
- **👨‍🎓 Student Dashboard** — Track sessions, progress, and upcoming bookings
- **👩‍🏫 Tutor Dashboard** — Manage availability, earnings, and student connections
- **🔔 Notifications** — Stay updated on bookings, messages, and session reminders
- **⚙️ Profile Management** — Customize profiles for both students and tutors
- **📱 PWA Support** — Installable as a Progressive Web App on mobile devices

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React (JSX), Vite                   |
| Backend     | Django 6.x + DRF                    |
| Database    | PostgreSQL (MVP uses SQLite dev)    |
| Schema      | OpenAPI 3.0 (drf-spectacular)       |

---

## 📂 Project Structure

```
learncrib/
├── frontend/                   # Visuals & PWA (Collab)
│   ├── index.html
│   ├── assets/
│   └── screens/                # Parent/Tutor/Shared folders
├── backend/                    # Logic & API (Django 6)
│   ├── core/                   # Project settings
│   ├── api/                    # REST Router & Specs
│   ├── users/                  # Auth & Profiles
│   ├── sessions_app/           # Core Logic & Escrow
│   └── payments/               # Paystack & Payouts
├── docs/                       # Project Documentation
│   ├── backend_flow.md         # Detailed Business Logic
│   ├── database_schema.sql     # Data Model Spec
│   └── ui_guide.md             # UI/UX & Design System
├── brand_kit/                  # Branding & Logos
└── Illustrations/              # SVG illustrations
```

---

## 🚀 Getting Started (Docker)

The fastest way to get the project running is using **Docker**. This sets up the database, backend, and frontend automatically.

1.  **Clone & Pull** the latest changes.
2.  **Start Docker**: Ensure Docker Desktop is running.
3.  **Run the Stack**:
    ```bash
    docker compose up --build
    ```
4.  **Access the App**:
    - **Frontend**: `http://localhost:5173`
    - **API Docs**: `http://localhost:8000/api/schema/swagger-ui/`

### 🔑 Test Credentials (via `seed_db`)
- **Admin**: `admin@learncrib.com` / `adminpass123`
- **Tutor**: `tutor1@example.com` / `password123`
- **Parent**: `parent1@example.com` / `password123`

---

## 🛠️ Manual Setup (Optional)

If you prefer to run things manually:

**Backend:**
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python manage.py migrate`
4. `python manage.py seed_db`
5. `python manage.py runserver`

**Frontend:**
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## ⚖️ Core Business Decisions

- **Commission:** 15% platform fee on all sessions.
- **Payouts:** Weekly tutor payouts processed every **Friday at 10:00 AM**.
- **Escrow:** Funds held until 48 hours post-session (Confirmation Window).
- **Cancellations:**
    - > 24h: Full refund to parent.
    - < 24h: 50% refund to parent, 50% to tutor (minus fees).
- **Disputes:** Manual admin resolution required for any flagged sessions.

---

## 🚀 Collaboration Workflow

To ensure a smooth workflow:

1. **Directories**:
   - `/frontend`: All UI work goes here.
   - `/backend`: All Django/API logic goes here.
2. **API Contract**: We use `/docs/backend_flow.md` and `/docs/database_schema.sql` as our unified source of truth.
3. **Branches**: Work on individual feature branches (e.g., `feature/tutor-auth`) and merge to `main`.

---

## 🎨 Brand

| Property        | Value                                  |
|-----------------|----------------------------------------|
| Primary Color   | `#1939D4`                              |
| Secondary Color | `#0A1444`                              |
| Accent Color    | `#F0B429`                              |
| Heading Font    | Outfit                                 |
| Body Font       | Inter                                  |
| Tagline         | *Where Learning Feels Like Home*       |

---

## 📄 License

This project is proprietary. All rights reserved.
