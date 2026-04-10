import uuid
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from users.models import User, TutorProfile, ParentProfile, Student
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
            import traceback
            self.stdout.write(traceback.format_exc())

    def create_users(self):
        # Create Superuser
        if not User.objects.filter(email='admin@learncrib.com').exists():
            User.objects.create_superuser(
                email='admin@learncrib.com', 
                password='adminpass123', 
                first_name='System', 
                last_name='Admin'
            )
            self.stdout.write('Created superuser: admin@learncrib.com')

        # Create Admins
        for i in range(1, 3):
            email = f'admin{i}@learncrib.com'
            if not User.objects.filter(email=email).exists():
                User.objects.create_user(
                    email=email, 
                    password='adminpass', 
                    role=User.Role.ADMIN, 
                    first_name='Admin', 
                    last_name=f'User{i}'
                )

        # Create Tutors
        self.tutors = []
        for i in range(1, 6):
            email = f'tutor{i}@example.com'
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email, 
                    password='password123', 
                    role=User.Role.TUTOR, 
                    first_name='Tutor', 
                    last_name=str(i)
                )
                profile = TutorProfile.objects.create(
                    user=user,
                    bio=f"Expert in Subject {i}. I have 10 years of experience.",
                    hourly_rate=random.randint(20, 100),
                    subjects=["Math", "Science", "History"][:random.randint(1,3)],
                    is_approved=(i % 2 == 0),
                    verification_status=TutorProfile.VerificationStatus.APPROVED if (i % 2 == 0) else TutorProfile.VerificationStatus.PENDING
                )
                self.tutors.append(profile)
        self.stdout.write(f'Created {len(self.tutors)} tutors')

        # Create Parents + Students
        self.parent_profiles = []
        self.students = []
        for i in range(1, 6):
            email = f'parent{i}@example.com'
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email, 
                    password='password123', 
                    role=User.Role.STUDENT, # Parents use STUDENT account type
                    first_name='Parent', 
                    last_name=str(i)
                )
                p_profile = ParentProfile.objects.create(user=user)
                self.parent_profiles.append(p_profile)
                
                # Create a child student for this parent
                student = Student.objects.create(
                    parent=p_profile,
                    first_name=f"ChildOf{i}",
                    last_name=f"Student",
                    grade_level=f"Grade {random.randint(1, 12)}"
                )
                self.students.append(student)

        self.stdout.write(f'Created {len(self.parent_profiles)} parents and {len(self.students)} students')

    def create_sessions_and_payments(self):
        if not self.tutors or not self.parent_profiles:
            return

        statuses = [Session.Status.PENDING, Session.Status.ACCEPTED, Session.Status.COMPLETED]
        
        for i in range(15):
            p_profile = random.choice(self.parent_profiles)
            student = Student.objects.filter(parent=p_profile).first()
            tutor = random.choice(self.tutors)
            status = random.choice(statuses)
            
            # Sessions need subjects
            subject = random.choice(tutor.subjects) if tutor.subjects else "General Knowledge"
            
            scheduled_at = timezone.now() + timezone.timedelta(days=random.randint(-10, 10))
            
            session = Session.objects.create(
                parent=p_profile,
                student=student,
                tutor=tutor,
                scheduled_at=scheduled_at,
                status=status,
                subject=subject,
                notes=f"Discussion notes for {subject}."
            )

            # Create payment if not just pending
            if status != Session.Status.PENDING:
                pay_status = Payment.Status.SUCCESSFUL if status == Session.Status.COMPLETED else Payment.Status.PENDING
                Payment.objects.create(
                    session=session,
                    parent=p_profile.user,
                    amount=tutor.hourly_rate,
                    status=pay_status,
                    provider_reference=f"ref_{uuid.uuid4().hex[:10]}"
                )

            # Create review if completed
            if status == Session.Status.COMPLETED:
                Review.objects.create(
                    booking=session,
                    student=p_profile.user,
                    tutor=tutor,
                    rating=random.randint(4, 5),
                    comment=f"Great session! Really helped with {session.subject}."
                )

        self.stdout.write('Created 15 sessions with associated payments and reviews')
