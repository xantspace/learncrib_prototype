# LearnCrib Backend (Django 6.x)

Welcome to the LearnCrib backend! This project is built exploring modern Django 6 features with a REST API layer for the frontend prototype.

## Tech Stack
- **Core:** Django 6.0.3+
- **API:** Django REST Framework (DRF)
- **Schema:** drf-spectacular (OpenAPI 3.0)
- **CORS:** django-cors-headers
- **Database:** SQLite (Default for MVP)

## Quick Start

1. **Activate Virtual Environment:**
   ```bash
   venv\Scripts\activate
   ```

2. **Setup Environment Variables:**
   - The project uses `.env` for secrets.
   - Look for `.env` in the `backend/` directory.
   - Key variables like `SECRET_KEY`, `DEBUG`, and `DATABASE_URL` are managed here.

3. **Run Server:**
   ```bash
   cd backend
   python manage.py runserver
   ```

3. **Access Admin Panel:**
   - **URL:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
   - **User:** `admin@learncrib.com`
   - **Pass:** `admin123`

4. **API Documentation:**
   - **Swagger:** [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
   - **Redoc:** [http://127.0.0.1:8000/api/redoc/](http://127.0.0.1:8000/api/redoc/)

## Project Structure
- `users/`: Custom User model, Roles (Parent, Tutor), and Student profiles.
- `sessions_app/`: Core marketplace logic. Handles `Session` states: `pending_approval`, `awaiting_payment`, `scheduled`, `completed`, `cancelled`.
- `payments/`: Paystack gateway integration, Escrow logic, and Tutor Payout tracking.
- `api/`: REST endpoints, Serializers, and OpenAPI schema configuration.
- `core/`: Base settings and project configuration.

## Core Business Logic (MVP)

As per `docs/backend_flow.md`, the system implements the following:

- **Escrow System:**
    1. Parent pays full amount to Platform.
    2. Platform holds funds and calculates **15% fee**.
    3. Session status becomes `scheduled`.
    4. Funds are released to Tutor **48 hours** after session completion (unless disputed).

- **Payout Schedule:**
    - Tutors are paid in batches every **Friday at 10:00 AM**.
    - Payout status moves: `pending` -> `held` -> `released` -> `paid`.

- **Cancellation Rules:**
    - **Early (>24h):** Parent gets 100% refund. Tutor gets ₦0.
    - **Late (<24h):** Parent gets 50% refund. Tutor gets 50% (minus 15% platform fee).
    - **No-Show (Tutor):** Full refund to parent. Tutor penalty applies.
    - **No-Show (Student):** No refund. Tutor gets 100%.

- **Verification:**
    - Tutors must be manually verified (`verification_status`) by an admin before their profile is public.
