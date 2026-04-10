from django.db import models
from users.models import ParentProfile, TutorProfile
from sessions_app.models import Session

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    session = models.ForeignKey(Session, on_delete=models.SET_NULL, null=True, related_name='payments')
    parent = models.ForeignKey(ParentProfile, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50) # e.g., 'card', 'transfer'
    provider = models.CharField(max_length=50, default='Paystack')
    provider_reference = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    initiated_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Payment: {self.amount} - {self.status}"

class Payout(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('held', 'Held'),
        ('released', 'Released'),
        ('paid', 'Paid'),
        ('withheld', 'Withheld'),
    ]

    session = models.ForeignKey(Session, on_delete=models.SET_NULL, null=True, related_name='payouts')
    tutor = models.ForeignKey(TutorProfile, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    scheduled_date = models.DateField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    bank_reference = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Payout: {self.amount} - {self.status}"

class Dispute(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
    ]
    
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='disputes')
    raised_by_type = models.CharField(max_length=10) # 'parent' or 'tutor'
    raised_by_id = models.UUIDField()
    
    reason = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    resolution_details = models.TextField(blank=True)
    parent_refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tutor_payment_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Dispute: {self.reason} - {self.status}"
