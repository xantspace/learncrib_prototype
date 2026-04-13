import uuid
from django.db import models
from users.models import User, ParentProfile, Student, TutorProfile


class Session(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE, related_name='sessions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='sessions')
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='sessions')

    subject_old = models.CharField(max_length=200, blank=True, null=True)  # Deprecated: kept for data migration
    subject = models.ForeignKey(
        'curriculum.Subject',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )  # AI Readiness: normalized subject for all ML features

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    scheduled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)  # AI Readiness: needed for duration calculations
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, null=True)

    duration_minutes = models.IntegerField(null=True, blank=True)  # Actual session duration
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        subject_name = self.subject.name if self.subject else self.subject_old or "No Subject"
        return f"{subject_name} - {self.status}"


class SessionLog(models.Model):
    """
    Enriched audit trail matching the backend_flow.md specification.
    The original only had session, action, actor_type, timestamp.

    Added: actor_id, status_before, status_after, details (JSON).
    Without these, logs are useless for ML pattern detection.

    V2 Impact: Performance Insights, Session Coordination Agent, dispute analysis
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=100)
    actor_type = models.CharField(max_length=50)  # ADMIN, TUTOR, PARENT, SYSTEM
    actor_id = models.UUIDField(null=True, blank=True)  # The user's ID (null if system action)

    status_before = models.CharField(max_length=20, blank=True, null=True)
    status_after = models.CharField(max_length=20, blank=True, null=True)

    details = models.JSONField(
        default=dict,
        blank=True
    )  # Flexible event-specific data (payment refs, durations, reasons, etc.)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.session_id} - {self.action} at {self.timestamp}"


class SessionNote(models.Model):
    """
    Tutor-submitted summary after each session. This is the primary data source
    for Performance Insights in V2.

    Without this, we have no record of what was actually taught, how the student
    performed, or what should happen next.

    V2 Impact: Performance Insights (primary), Adaptive Learning, Parent Reports
    """
    class PerformanceRating(models.TextChoices):
        EXCELLENT = 'EXCELLENT', 'Excellent'
        GOOD = 'GOOD', 'Good'
        AVERAGE = 'AVERAGE', 'Average'
        BELOW_AVERAGE = 'BELOW_AVERAGE', 'Below Average'
        STRUGGLING = 'STRUGGLING', 'Struggling'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='session_note')
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='session_notes')

    summary = models.TextField()  # What was covered in the session
    student_performance = models.CharField(
        max_length=20,
        choices=PerformanceRating.choices,
        default=PerformanceRating.AVERAGE
    )
    strengths = models.TextField(blank=True, null=True)
    areas_for_improvement = models.TextField(blank=True, null=True)
    homework_assigned = models.TextField(blank=True, null=True)
    next_session_recommendations = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note for session {self.session_id}"


class SessionTopic(models.Model):
    """
    Junction table linking sessions to specific curriculum topics covered.
    A Mathematics session might cover Quadratic Equations and Simultaneous Equations.

    V2 Impact: Adaptive Learning (mastery per topic), Performance Insights (gap detection),
               Content Generation (targeted practice)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='topics_covered')
    topic = models.ForeignKey(
        'curriculum.CurriculumTag',
        on_delete=models.CASCADE,
        related_name='sessions_covering'
    )

    class Meta:
        unique_together = ['session', 'topic']

    def __str__(self):
        return f"{self.session_id} - {self.topic.name}"
        