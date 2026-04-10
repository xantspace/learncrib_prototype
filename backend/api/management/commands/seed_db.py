import uuid
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from users.models import User, TutorProfile
from sessions_app.models import Session
from payments.models import Payment, Payout
from reviews.models import Review

class Command(BaseCommand):
    help = 'Seeds the database with development data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        try:
            with transaction.atomic():
                self.create_users()
                self.create_sessions_and_payments()
            self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Seeding failed: {e}'))

    def create_users(self):
        # Create Superuser
        if not User.objects.filter(email='admin@learncrib.com').exists():
            User.objects.create_superuser('admin@learncrib.com', 'adminpass123', full_name='System Admin')
            self.stdout.write('Created superuser: admin@learncrib.com')

        # Create Admins
        for i in range(1, 3):
            email = f'admin{i}@learncrib.com'
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(email, 'adminpass', role=User.Role.ADMIN, full_name=f'Admin User {i}')

        # Create Tutors
        self.tutors = []
        for i in range(1, 6):
            email = f'tutor{i}@example.com'
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(email, 'password123', role=User.Role.TUTOR, full_name=f'Tutor Name {i}')
                profile = TutorProfile.objects.create(
                    user=user,
                    bio=f"Expert in Subject {i}. I have 10 years of experience.",
                    hourly_rate=random.randint(20, 100),
                    subjects=["Math", "Science", "History"][:random.randint(1,3)],
                    is_verified=(i % 2 == 0)
                )
                self.tutors.append(profile)
        self.stdout.write(f'Created {len(self.tutors)} tutors')

        # Create Parents
        self.parents = []
        for i in range(1, 6):
            email = f'parent{i}@example.com'
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(email, 'password123', role=User.Role.PARENT, full_name=f'Parent Name {i}')
                self.parents.append(user)
        self.stdout.write(f'Created {len(self.parents)} parents')

    def create_sessions_and_payments(self):
        if not self.tutors or not self.parents:
            return

        statuses = [Session.Status.REQUESTED, Session.Status.SCHEDULED, Session.Status.COMPLETED]
        
        for i in range(15):
            parent = random.choice(self.parents)
            tutor = random.choice(self.tutors)
            status = random.choice(statuses)
            
            start_time = timezone.now() + timezone.timedelta(days=random.randint(-10, 10))
            
            session = Session.objects.create(
                parent=parent,
                tutor=tutor,
                start_time=start_time,
                end_time=start_time + timezone.timedelta(hours=1),
                status=status,
                topic=f"Topic Discussion {i}",
                amount=tutor.hourly_rate
            )

            # Create payment if not just requested
            if status != Session.Status.REQUESTED:
                pay_status = Payment.Status.COMPLETED if status == Session.Status.COMPLETED else Payment.Status.PENDING
                Payment.objects.create(
                    session=session,
                    amount=session.amount,
                    status=pay_status,
                    paystack_ref=f"ref_{uuid.uuid4().hex[:10]}"
                )

            # Create review if completed
            if status == Session.Status.COMPLETED:
                Review.objects.create(
                    booking=session,
                    student=parent,
                    tutor=tutor,
                    rating=random.randint(4, 5),
                    comment=f"Great session! Really helped with {session.topic}."
                )

        self.stdout.write('Created 15 sessions with associated payments and reviews')
