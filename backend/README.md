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

2. **Run Server:**
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
- `users/`: Handles Authentication, Parent/Tutor roles, and Student profiles.
- `sessions_app/`: Core marketplace logic for bookings and session management.
- `payments/`: Paystack integration, Escrow handling, and Disputes.
- `api/`: REST endpoints and Serializers.
