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
| Markup      | HTML5                               |
| Styling     | Tailwind CSS (CDN)                  |
| Typography  | Outfit, Inter (Google Fonts)        |
| Icons       | Lucide Icons                        |
| Deployment  | Vercel                              |
| PWA         | Web App Manifest                    |

---

## 📂 Project Structure

```
learncrib/
├── prototype/
│   ├── index.html              # Entry point (redirects to splash)
│   ├── manifest.json           # PWA manifest
│   ├── vercel.json             # Vercel deployment config
│   ├── assets/
│   │   ├── css/                # Stylesheets
│   │   └── img/                # Images, icons, logos
│   └── screens/
│       ├── splash.html         # Splash screen
│       ├── welcome.html        # Onboarding welcome
│       ├── onboarding.html     # Onboarding flow
│       ├── role-selection.html # Student / Tutor selection
│       ├── login.html          # Login
│       ├── signup.html         # Registration
│       ├── student-dashboard.html
│       ├── tutor-dashboard.html
│       ├── search-results.html
│       ├── tutor-profile.html
│       ├── book-session.html
│       ├── payment.html
│       ├── booking-confirmation.html
│       ├── messages.html
│       ├── notifications.html
│       ├── settings.html
│       ├── student-profile.html
│       ├── student-sessions.html
│       ├── tutor-availability.html
│       ├── tutor-earnings.html
│       ├── tutor-profile-edit.html
│       ├── tutor-students.html
│       └── help-support.html
├── brand_kit/                  # Brand guidelines & logos
├── Illustrations/              # SVG illustrations
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Safari, Firefox, Edge)

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/learncrib.git
   cd learncrib
   ```

2. **Open the prototype**
   Open `prototype/index.html` in your browser, or use a local server:
   ```bash
   npx serve prototype
   ```

3. **View on mobile**
   Use your browser's device toolbar (F12 → Toggle Device) for the best mobile experience.

### Deploy to Vercel

```bash
cd prototype
npx vercel --prod
```

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

---

## 🤝 Contributing

This is currently a private prototype. For collaboration inquiries, please reach out to the project maintainer.
