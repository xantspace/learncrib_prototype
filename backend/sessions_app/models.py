from django.db import models
from users.models import ParentProfile, Student, TutorProfile

class Session(models.Model):
    STATUS_CHOICES = [
        ('pending_approval', 'Pending Approval'),
        ('awaiting_payment', 'Awaiting Payment'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    parent = models.ForeignKey(ParentProfile, on_delete=models.SET_NULL, null=True)
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True)
    tutor = models.ForeignKey(TutorProfile, on_delete=models.SET_NULL, null=True)
    
    subject = models.CharField(max_length=100)
    scheduled_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField()
    
    # Financials
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=12, decimal_places=2)
    tutor_payout_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_approval')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    def __str__(self):
        return f"Session: {self.subject} - {self.scheduled_date}"

class SessionLog(models.Model):
    ACTOR_CHOICES = [
        ('parent', 'Parent'),
        ('tutor', 'Tutor'),
        ('system', 'System'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    actor_type = models.CharField(max_length=10, choices=ACTOR_CHOICES)
    actor_id = models.UUIDField(null=True, blank=True) # ID of the user who did the action
    action = models.CharField(max_length=100)
    status_before = models.CharField(max_length=20, blank=True)
    status_after = models.CharField(max_length=20, blank=True)
    event_details = models.JSONField(default=dict)

    def __str__(self):
        return f"Log: {self.action} on {self.timestamp}"
