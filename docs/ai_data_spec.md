# LearnCrib AI Data Capture Specification

**Prepared by:** Emmanuel Nwanguma (AI/ML Engineering Lead)  
**Date:** April 2026  
**Version:** 1.0  
**Branch:** `ai-dev`

---

## Purpose

This document specifies every new table and field added to the V1 schema to support V2 AI features. It serves as the formal contract between the AI/ML team and the Backend team.

Every addition has a direct line to a V2 AI feature. Nothing is speculative.

---

## Summary of Changes

### New Apps Created

| App | Purpose | Models |
|-----|---------|--------|
| `curriculum` | Subject/grade normalization, curriculum taxonomy, content storage | Subject, GradeLevel, CurriculumTag, ContentResource |
| `ai_analytics` | Behavioral event tracking for ML pipelines | AIEvent |

### Existing Apps Modified

| App | Changes |
|-----|---------|
| `users` | Added `last_active_at` to User. Changed Student.grade_level to FK. Changed TutorProfile.subjects to M2M. |
| `sessions_app` | Changed Session.subject to FK. Added completed_at, cancelled_at, cancellation_reason, duration_minutes. Enriched SessionLog with actor_id, status_before, status_after, details. Added SessionNote and SessionTopic models. |
| `reviews` | Activated in INSTALLED_APPS. Added knowledge_rating, communication_rating, punctuality_rating. |
| `payments` | Improved Dispute with TextChoices, Category enum, raised_by FK, resolution fields. |

---

## New Tables — Detailed Specification

### curriculum.Subject

Single source of truth for subject names. Eliminates "Mathematics" vs "Maths" vs "math" problem.

| Field | Type | Purpose | V2 Feature |
|-------|------|---------|------------|
| name | CharField(100) | Display name | All |
| slug | SlugField(100) | URL-safe identifier | API/RAG |
| is_active | Boolean | Soft delete | All |

### curriculum.GradeLevel

Standardized Nigerian education levels. Replaces free-text on Student.

| Field | Type | Purpose | V2 Feature |
|-------|------|---------|------------|
| name | CharField(50) | Short name (SS1) | All |
| display_name | CharField(100) | Full name (Senior Secondary 1) | Reports |
| order | Integer | Sorting (JSS1=1 through SS3=6) | Adaptive Learning |

### curriculum.CurriculumTag

Hierarchical taxonomy: exam_body > subject > topic > subtopic. Backbone of curriculum-aware AI.

| Field | Type | Purpose | V2 Feature |
|-------|------|---------|------------|
| subject | FK(Subject) | Which subject | RAG, Adaptive |
| exam_body | Enum(WAEC/JAMB/NECO/GENERAL) | Curriculum alignment | RAG, Content Gen |
| level | Enum(TOPIC/SUBTOPIC) | Hierarchy depth | All |
| name | CharField(200) | Topic name | All |
| parent | FK(self) | Subtopics point to parent topic | Adaptive Learning |
| grade_levels | M2M(GradeLevel) | Which grades this applies to | Content Gen |

### curriculum.ContentResource

Knowledge base for RAG assistant. Stores learning materials with full metadata.

| Field | Type | Purpose | V2 Feature |
|-------|------|---------|------------|
| title | CharField(300) | Resource title | RAG |
| content | TextField | Raw text for RAG indexing | RAG (primary) |
| file_url | URLField | File-based resources | RAG |
| subject | FK(Subject) | Subject classification | RAG, filtering |
| topics | M2M(CurriculumTag) | Topic alignment | RAG retrieval |
| grade_levels | M2M(GradeLevel) | Grade targeting | Adaptive |
| content_type | Enum | Lesson note, past question, etc. | Content Gen |
| difficulty | Enum | Beginner/Intermediate/Advanced | Adaptive |
| is_approved | Boolean | Lead Educator review gate | Safety |
| view_count | Integer | Engagement tracking | Recommendations |

### sessions_app.SessionNote

Tutor-submitted session summary. Primary data source for Performance Insights.

| Field | Type | Purpose | V2 Feature |
|-------|------|---------|------------|
| session | FK(Session) | Which session | Insights |
| summary | TextField | What was covered | Insights, Reports |
| student_performance | Enum | Excellent through Struggling | Insights, Adaptive |
| strengths | TextField | What student did well | Reports |
| areas_for_improvement | TextField | Where student struggled | Adaptive, Reports |
| homework_assigned | TextField | Homework given | Reports |
| next_session_recommendations | TextField | Tutor's suggestions | Adaptive |

### sessions_app.SessionTopic

Junction table: which curriculum topics were covered in each session. Enables topic-level mastery tracking.

| Field | Type | Purpose | V2 Feature |
|-------|------|---------|------------|
| session | FK(Session) | Which session | Adaptive |
| topic | FK(CurriculumTag) | Which topic | Adaptive, Insights |

### ai_analytics.AIEvent

Append-only behavioral event log. Captures user activity outside session transactions.

| Field | Type | Purpose | V2 Feature |
|-------|------|---------|------------|
| user | FK(User) | Who performed the action | All |
| event_type | CharField(100) | Event name (e.g. tutor_profile_viewed) | All |
| category | Enum | SEARCH/BROWSE/ENGAGEMENT/BOOKING/CONTENT/FEEDBACK/SYSTEM | Filtering |
| session | FK(Session, optional) | Session context if applicable | Insights |
| resource | FK(ContentResource, optional) | Resource context if applicable | Recommendations |
| metadata | JSONField | Flexible event-specific data | All |

**Event types to implement:**
- `search_performed` — parent searched for tutors (metadata: query, filters, results_count)
- `tutor_profile_viewed` — parent viewed a tutor profile (metadata: tutor_id, time_on_profile_seconds)
- `tutor_shortlisted` — parent saved a tutor (metadata: tutor_id)
- `booking_started` — parent began booking flow (metadata: tutor_id, subject)
- `booking_abandoned` — parent left booking flow without completing (metadata: step, tutor_id)
- `resource_accessed` — student opened a learning resource (metadata: resource_id, content_type)
- `resource_completed` — student finished a resource (metadata: resource_id, completion_percentage)
- `filter_applied` — parent used search filters (metadata: filters dict)

---

## Modified Fields — Detailed Specification

### User.last_active_at
- **Type:** DateTimeField, nullable
- **Purpose:** Track ongoing engagement beyond login. Update on any API request.
- **V2 Feature:** Churn prediction, inactive tutor filtering

### Student.grade_level (changed from CharField to FK)
- **Old:** CharField(max_length=50) — free text
- **New:** FK(curriculum.GradeLevel) — normalized
- **Migration:** Old field renamed to grade_level_old for data migration

### TutorProfile.subjects (changed from JSONField to M2M)
- **Old:** JSONField storing ["Math", "Physics"]
- **New:** ManyToManyField(curriculum.Subject)
- **Migration:** Old field renamed to subjects_old for data migration

### Session.subject (changed from CharField to FK)
- **Old:** CharField(max_length=200) — free text
- **New:** FK(curriculum.Subject)
- **Migration:** Old field renamed to subject_old for data migration

### SessionLog (enriched)
- **Added:** actor_id (UUID), status_before (CharField), status_after (CharField), details (JSONField)
- **Matches:** backend_flow.md specification which defined all four of these fields

### Review (extended)
- **Added:** knowledge_rating, communication_rating, punctuality_rating (all IntegerField 1-5)
- **Purpose:** Tutor Discovery Agent needs dimensional quality signals

### Dispute (improved)
- **Added:** Category enum (NO_SHOW, SESSION_QUALITY, SHORT_SESSION, etc.), raised_by FK, resolution, resolved_at, parent_refund, tutor_payment
- **Purpose:** Categorized disputes enable pattern detection

---

## V2 Feature → Data Dependency Map

| V2 Feature | Required Data |
|------------|---------------|
| RAG Q&A Assistant | ContentResource, CurriculumTag, Subject |
| Tutor Discovery Agent | Subject (M2M), Review dimensions, AIEvent (search/browse), tutor_metrics |
| Performance Insights | SessionNote, SessionTopic, Review, Session.completed_at/duration |
| Session Coordination Agent | AIEvent (booking patterns), SessionLog (enriched) |
| Parent Support Chatbot | ContentResource (FAQ type) |
| Adaptive Learning | CurriculumTag hierarchy, SessionTopic (mastery), GradeLevel, ContentResource (difficulty) |
| AI Content Generation | CurriculumTag (curriculum alignment), GradeLevel, Subject |

---

**Document Prepared By:** Emmanuel Nwanguma  
**Role:** AI/ML Engineering Lead  
**Contact:** LearnCrib AI Team
