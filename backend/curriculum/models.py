import uuid
from django.db import models


class Subject(models.Model):
    """
    Master list of subjects. Single source of truth — replaces all free-text
    subject fields across the codebase.

    V2 Impact: RAG Assistant, Tutor Discovery Agent, Adaptive Learning
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)  # e.g. "Mathematics"
    slug = models.SlugField(max_length=100, unique=True)  # e.g. "mathematics"
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class GradeLevel(models.Model):
    """
    Standardized grade levels for Nigerian education system.
    Replaces the free-text grade_level on Student.

    V2 Impact: Adaptive Learning, Content Generation, Performance Insights
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)  # e.g. "SS1"
    display_name = models.CharField(max_length=100)  # e.g. "Senior Secondary 1"
    order = models.IntegerField(default=0)  # For sorting: JSS1=1, JSS2=2, ... SS3=6

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.display_name


class CurriculumTag(models.Model):
    """
    Hierarchical taxonomy: exam_body → subject → topic → subtopic.
    This is the backbone of curriculum-aware AI in V2.

    Examples:
        WAEC → Mathematics → Algebra → Quadratic Equations
        JAMB → Physics → Mechanics → Newton's Laws
        NECO → English → Comprehension → Passage Analysis

    V2 Impact: RAG Assistant (retrieval), Content Generation (alignment),
               Adaptive Learning (mastery tracking), Performance Insights (gap detection)
    """
    class ExamBody(models.TextChoices):
        WAEC = 'WAEC', 'WAEC'
        JAMB = 'JAMB', 'JAMB'
        NECO = 'NECO', 'NECO'
        GENERAL = 'GENERAL', 'General'  # For content not tied to a specific exam

    class TagLevel(models.TextChoices):
        TOPIC = 'TOPIC', 'Topic'
        SUBTOPIC = 'SUBTOPIC', 'Subtopic'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='curriculum_tags')
    exam_body = models.CharField(
        max_length=20,
        choices=ExamBody.choices,
        default=ExamBody.GENERAL
    )
    level = models.CharField(max_length=20, choices=TagLevel.choices)
    name = models.CharField(max_length=200)  # e.g. "Quadratic Equations"
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )  # Subtopics point to their parent topic

    grade_levels = models.ManyToManyField(
        GradeLevel,
        blank=True,
        related_name='curriculum_tags'
    )  # Which grade levels this topic applies to

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['subject', 'name']
        unique_together = ['subject', 'exam_body', 'name', 'parent']

    def __str__(self):
        prefix = f"[{self.exam_body}] " if self.exam_body != self.ExamBody.GENERAL else ""
        return f"{prefix}{self.subject.name} → {self.name}"


class ContentResource(models.Model):
    """
    Learning materials with full metadata. This is the knowledge base
    that the RAG assistant will retrieve from in V2.

    V2 Impact: RAG Q&A Assistant (primary data source), Content Generation,
               Adaptive Learning (resource recommendations)
    """
    class ContentType(models.TextChoices):
        LESSON_NOTE = 'LESSON_NOTE', 'Lesson Note'
        PAST_QUESTION = 'PAST_QUESTION', 'Past Question'
        PRACTICE_QUIZ = 'PRACTICE_QUIZ', 'Practice Quiz'
        STUDY_GUIDE = 'STUDY_GUIDE', 'Study Guide'
        FLASHCARD = 'FLASHCARD', 'Flashcard'
        VIDEO_LINK = 'VIDEO_LINK', 'Video Link'
        OTHER = 'OTHER', 'Other'

    class DifficultyLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)  # Raw text content for RAG indexing
    file_url = models.URLField(blank=True, null=True)  # For file-based resources

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='resources')
    topics = models.ManyToManyField(
        CurriculumTag,
        blank=True,
        related_name='resources'
    )
    grade_levels = models.ManyToManyField(
        GradeLevel,
        blank=True,
        related_name='resources'
    )

    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.OTHER
    )
    difficulty = models.CharField(
        max_length=20,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.INTERMEDIATE
    )

    is_approved = models.BooleanField(default=False)  # Must be reviewed by Lead Educator
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_resources'
    )

    # Engagement tracking (populated by ai_analytics events)
    view_count = models.IntegerField(default=0)
    completion_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.subject.name})"
