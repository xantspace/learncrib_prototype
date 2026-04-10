# 🏠 LearnCrib: UI/UX Design System & Experience Guide

> **Mantra:** "Where Learning Feels Like Home"  
> **Brand Vision:** Combining the warmth of a "Crib" with the precision of high-end education.  
> **Aesthetic Path:** Glassmorphism, Vibrance, and Clarity.

---

## 🎨 Global Design System

### Color Palette (HSL-First)

| Token | HSL | HEX | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary** | `hsl(175, 100%, 33%)` | `#00A89D` | CTAs, Success, Highlights |
| **Secondary** | `hsl(220, 40%, 15%)` | `#1A2B44` | Headers, Dark text, Trust |
| **Accent** | `hsl(45, 100%, 50%)` | `#FFBF00` | Stars, Ratings, Notifications |
| **Glass Light**| `hsla(0, 0%, 100%, 0.7)`| - | Glass panels, cards |
| **Glass Dark** | `hsla(220, 40%, 10%, 0.8)`| - | Dark mode backgrounds |

---

## 🔐 AUTHENTICATION FLOW


### 1. Splash & Welcome

- **Visuals:** Center animated illustration from `@[Illustrations]`.
- **Background:** Soft mesh gradients using Primary and Secondary hues.
- **Buttons:** 
  - Primary button: Large, rounded-full, Teal background with shadow.
  - Login link: Subtle uppercase tracking, Secondary color.

### 2. Sign Up & Role Selection

- **Role Cards:** 
  - **Student:** Gradient border, Lucide `GraduationCap` icon.
  - **Tutor:** Glassmorphic filled, Lucide `UserCheck` icon.
- **Form:** Material-style floating labels with Lucide icons (`Mail`, `Lock`, `Smartphone`).
- **Permission:** Toast-style micro-interaction for Location request.

---

## 🎠 WELCOME CAROUSEL COMPONENT
*Designed for the first-time user experience to drive clarity and engagement.*

### Layout Structure

- **Illustration (Top):** Large, centered svg from `@[Illustrations]`. Floating animation with `transition: transform 0.5s ease-in-out`.
- **Content (Middle):**
  - **Title:** `Outfit` (Bold, 600), Primary Teal.
  - **Body:** `Inter` (Medium, 400), Secondary Navy (80% opacity).
- **Navigation (Bottom):**
  - **Skip (Left):** Ghost button, "Skip", Lucide `ChevronsRight` (on hover).
  - **Pagination (Center):** 3-4 subtle dots, active one is Teal.
  - **Next (Right):** Rounded-full button, Primary Teal, Lucide `ArrowRight`.

### Slide Mapping

1. **Discover Knowledge:** `math.svg` — *"Learn anything, from algebra to astrophysics."*
2. **The Perfect Match:** `file-searching.svg` — *"Our AI finds tutors that fit your learning style."*
3. **Real-Time Connection:** `message-sent.svg` — *"Seamless chat to clarify goals before you book."*
4. **Ready to Start:** `personal-information.svg` — *"Tell us about your goals and find your crib."*

---

## 🎓 STUDENT SCREENS

| Screen | Primary Elements | Icons (Lucide) |
| :--- | :--- | :--- |
| **Dashboard** | Search-focused header, recommended tutors | `Search`, `SlidersHorizontal`, `Star` |
| **Search/Filter** | Proximity slider (Primary Teal), Chips | `Navigation`, `DollarSign`, `Clock` |
| **Results** | Card layout, Availability pulse animation | `ChevronRight`, `MapPin`, `CreditCard` |
| **Profile** | Bio, Credentials, Calendar, Reviews | `BookOpen`, `Info`, `CalendarDays`, `MessageCircle` |
| **Booking** | Duration selector, Session type toggle | `Timer`, `Globe`, `Home`, `Plus` |
| **Payment** | Total sum (Large), Card input, Pay button | `CreditCard`, `Lock`, `CheckCircle` |
| **Sessions** | Tabbed views (Upcoming/Completed) | `History`, `Calendar`, `XCircle` |

---

## ⏳ SESSION LIFECYCLE & RULES (BAKEND ALIGNMENT)
*Crucial logic for UI state management.*

### 1. Booking States
- **Pending Approval:** Show "Waiting for Tutor" status. Give Parent "Cancel" option.
- **Awaiting Payment:** Tutor accepted. Trigger "Pay Now" CTA for Parent. Show 24h countdown.
- **Scheduled:** Payment confirmed. Show "Session Details" and "Join" button (when active).

### 2. Post-Session Flow (Escrow)
- **Confirmation Window:** After a session ends, it enters a **48-hour** confirmation period.
- **Parent View:** Show "Confirm Completion" button. If not clicked within 48h, system auto-confirms.
- **Dispute Option:** "Report an Issue" must be clearly visible during the 48h window.

### 3. Cancellation Policy (UI Prompts)
- **Warning Dialog:** When a user clicks "Cancel Session", show logic-based warnings:
    - **> 24 hours notice:** "You will receive a 100% refund."
    - **< 24 hours notice:** "Warning: Late cancellation results in a 50% penalty."

---

## 👨‍🏫 TUTOR SCREENS

| Screen | Primary Elements | Icons (Lucide) |
| :--- | :--- | :--- |
| **Dashboard** | Earnings summary, quick stats cards | `TrendingUp`, `Users`, `Award`, `DollarSign` |
| **Availability** | Weekly grid, recurring schedule engine | `Calendar`, `Repeat`, `Clock` |
| **Students** | List with session history, notes | `User`, `Edit3`, `ClipboardList` |
| **Earnings** | Payout request, transaction history | `Wallet`, `ExternalLink`, `FileText` |

---

## 🛠️ SHARED COMPONENTS & UTILITY

### 🏷️ Onboarding
1. **Student:** Select subjects (Lucide `CheckCircle`), Set location (`Map`), Enable notifications (`Bell`).
2. **Tutor:** Subjects, Education (`Book`), Set rate (`DollarSign`), Availability, Profile Photo.

### 💬 Messaging
- **UI:** Similar to iMessage/WhatsApp with glassmorphic bubbles.
- **Indicators:** `CheckCheck` for read receipts.

### ⚙️ Settings
- **Category Icons:** `User`, `Lock`, `Bell`, `CreditCard`, `HelpCircle`, `LogOut`.
- **Theme Toggle:** Smooth switch animation with Lucide `Sun` and `Moon`.

---

## ✨ MICRO-INTERACTIONS & MOTION
*The soul of a high-end application.*

### State Transitions
- **Glass Panel Entry:** Soft fade-in with a vertical slide: `translateY(20px) -> 0`.
- **Button Hover:** Primary buttons should have a subtle "pulse" glow using `box-shadow: 0 0 15px hsla(175, 100%, 33%, 0.4)`.
- **List Interaction:** Tutor cards lift on hover (`transform: translateY(-4px)`) and increase border opacity.

### Loading States
- **Skeletons:** Use shimmering glassmorphic skeletons for tutor profile loading.
- **Success Paths:** Lottie-based "checkmarks" for payment and booking confirmation.

---

## 🔔 NOTIFICATIONS CENTER
- **Bell Icon:** Lucide `Bell`. Red dot indicator with a "ding" animation on arrival.
- **Card Layout:**
  - **Booking Alert:** `Calendar` icon + "New session requested by [Student Name]".
  - **Message:** `MessageCircle` + "[Tutor Name] sent you a message".
  - **Payout:** `DollarSign` (Teal) + "Your payout of $240 is on its way".
- **Action:** Swipe right to mark as read, swipe left to delete.

---

## 🆘 HELP & SUPPORT
- **Top Section:** High-width search bar: "How can we help?".
- **FAQ Accordion:** Minimalist borders, Lucide `Plus`/`Minus` icons for expansion.
- **Live Chat:** Sticky FAB with Lucide `MessageSquareMore`.
- **Quick Guides:** Horizontal carousel of cards with smaller `@[Illustrations]`.

---

## ⚙️ SETTINGS & PREFERENCES
- **Layout:** Vertical list of menu items with icons.
- **Dark Mode:** System-wide toggle (`Moon` and `Sun` icons).
- **Language:** Segmented control for English/Hausa/Yoruba/Igbo (for localized reach).

---

## 📂 Asset Manifest
> [!IMPORTANT]
> Use absolute paths for production development:

- **Illustrations Directory:** `c:\dev\learncrib\Illustrations`
- **Brand Kit:** `c:\dev\learncrib\brand_kit`
