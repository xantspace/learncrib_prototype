import uuid
from django.db import models
from users.models import User, TutorProfile
from sessions_app.models import Session

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='review')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='reviews_received')
    
    rating = models.IntegerField() # 1-5 overall
    
    # AI Readiness: dimension-specific ratings for Tutor Discovery Agent
    # The single overall rating isn't enough — V2 needs to know WHY a tutor is rated highly
    knowledge_rating = models.IntegerField(null=True, blank=True)  # 1-5: subject expertise
    communication_rating = models.IntegerField(null=True, blank=True)  # 1-5: teaching clarity
    punctuality_rating = models.IntegerField(null=True, blank=True)  # 1-5: timeliness
    
    comment = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.tutor.user.email} - {self.rating}*"
        