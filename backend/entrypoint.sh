#!/bin/bash

# backend/entrypoint.sh

echo "Applying database migrations..."
python manage.py migrate

echo "Checking for existing data..."
# Use a simple python snippet to check if users exist before seeding
USER_COUNT=$(python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings'); import django; django.setup(); from users.models import User; print(User.objects.count())")

if [ "$USER_COUNT" -le 1 ]; then
    echo "Seeding database..."
    python manage.py seed_db
else
    echo "Database already contains data, skipping seed."
fi

echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
