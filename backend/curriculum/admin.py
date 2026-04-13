from django.contrib import admin
from .models import Subject, GradeLevel, CurriculumTag, ContentResource


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(GradeLevel)
class GradeLevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_name', 'order']
    ordering = ['order']


@admin.register(CurriculumTag)
class CurriculumTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'exam_body', 'level', 'parent']
    list_filter = ['exam_body', 'level', 'subject']
    search_fields = ['name']


@admin.register(ContentResource)
class ContentResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'content_type', 'difficulty', 'is_approved', 'is_active']
    list_filter = ['content_type', 'difficulty', 'is_approved', 'subject']
    search_fields = ['title', 'description']
