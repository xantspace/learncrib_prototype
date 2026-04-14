#!/bin/sh

# learncrib/backend/entrypoint.sh

echo "── LEARN CRIB BACKEND BOOT 🚀 ──"

# 1. Wait for DB (SQLite is instant, but good pattern for Postgres/MySQL)
echo "Ensuring DB readiness..."

# 2. Run migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# 3. Seed DB with sample data
echo "Seeding default admin, tutor, and parent accounts..."
python manage.py seed_db

# 4. Collect static files
echo "Collecting static assets..."
python manage.py collectstatic --noinput

# 5. Start Server
echo "Starting development server on 0.0.0.0:8000..."
exec python manage.py runserver 0.0.0.0:8000
