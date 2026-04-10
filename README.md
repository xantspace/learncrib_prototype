# 📚 LearnCrib

**Where Learning Feels Like Home**

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
| Frontend    | HTML5, Tailwind CSS, JS             |
| Backend     | Python / FastAPI (In progress)      |
| Database    | PostgreSQL                          |
| Deployment  | Vercel                              |

---

## 📂 Project Structure

```
learncrib/
├── frontend/                   # Visuals & PWA (Collab)
│   ├── index.html
│   ├── assets/
│   └── screens/                # Parent/Tutor/Shared folders
├── backend/                    # Logic & API (Me)
│   ├── main.py
│   └── requirements.txt
├── docs/                       # Project Documentation
│   ├── backend_flow.md
│   └── database_schema.sql
├── brand_kit/                  # Branding & Logos
└── Illustrations/              # SVG illustrations
```

---

## 🚀 Collaboration Workflow

To ensure a smooth workflow between **Frontend** and **Backend**:

1. **Directories**:
   - `/frontend`: All UI work goes here.
   - `/backend`: All API and Database logic goes here.
2. **API Contract**: We use `/docs/database_schema.sql` as our unified data model.
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
