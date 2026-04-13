import uuid
from django.db import models


class AIEvent(models.Model):
    """
    Append-only behavioral event log for ML consumption.
    Captures everything outside the transactional session flow:
    searches, profile views, content engagement, browse patterns.

    This is separate from SessionLog (which tracks session lifecycle events).
    AIEvent tracks USER BEHAVIOR across the entire platform.

    V2 Impact: Tutor Discovery Agent (search/browse patterns),
               Session Coordination Agent (booking patterns),
               Adaptive Learning (content engagement),
               Performance Insights (engagement signals)
    """
    class EventCategory(models.TextChoices):
        SEARCH = 'SEARCH', 'Search'
        BROWSE = 'BROWSE', 'Browse'
        ENGAGEMENT = 'ENGAGEMENT', 'Engagement'
        BOOKING = 'BOOKING', 'Booking'
        CONTENT = 'CONTENT', 'Content'
        FEEDBACK = 'FEEDBACK', 'Feedback'
        SYSTEM = 'SYSTEM', 'System'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='ai_events'
    )

    event_type = models.CharField(max_length=100)
    # Examples:
    #   tutor_profile_viewed, search_performed, resource_accessed,
    #   filter_applied, session_feedback_submitted, content_completed,
    #   booking_started, booking_abandoned, tutor_shortlisted

    category = models.CharField(
        max_length=20,
        choices=EventCategory.choices,
        default=EventCategory.SYSTEM
    )

    # Optional FKs for context — null when event is not tied to a session or resource
    session = models.ForeignKey(
        'sessions_app.Session',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_events'
    )
    resource = models.ForeignKey(
        'curriculum.ContentResource',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_events'
    )

    metadata = models.JSONField(
        default=dict,
        blank=True
    )
    # Flexible event-specific data. Examples:
    #   {"query": "physics tutor lagos", "results_count": 12}
    #   {"tutor_id": "...", "time_on_profile_seconds": 45}
    #   {"resource_id": "...", "completion_percentage": 80}
    #   {"filters": {"subject": "Mathematics", "max_rate": 5000}}

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['category', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user_id} - {self.event_type} at {self.created_at}"
