import uuid
from django.db import models
from users.models import User, TutorProfile
from sessions_app.models import Session

class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESSFUL = 'SUCCESSFUL', 'Successful'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='payment')
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    provider = models.CharField(max_length=50, default='paystack')
    provider_reference = models.CharField(max_length=100, unique=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

class Payout(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        PROCESSED = 'PROCESSED', 'Processed'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='payouts')
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='payout')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    scheduled_date = models.DateField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

class Dispute(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    class Category(models.TextChoices):
        NO_SHOW = 'NO_SHOW', 'No Show'
        SESSION_QUALITY = 'SESSION_QUALITY', 'Session Quality'
        SHORT_SESSION = 'SHORT_SESSION', 'Short Session'
        WRONG_SUBJECT = 'WRONG_SUBJECT', 'Wrong Subject'
        TUTOR_BEHAVIOUR = 'TUTOR_BEHAVIOUR', 'Tutor Behaviour'
        PAYMENT_ISSUE = 'PAYMENT_ISSUE', 'Payment Issue'
        OTHER = 'OTHER', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='dispute')
    raised_by_type = models.CharField(max_length=50)  # PARENT, TUTOR
    raised_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='disputes_raised')

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )  # AI Readiness: categorized reasons for pattern detection
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)

    resolution = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    parent_refund = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tutor_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    