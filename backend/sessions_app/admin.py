from django.contrib import admin
from .models import Session, SessionLog, SessionNote, SessionTopic

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'tutor', 'parent', 'scheduled_at', 'status')
    list_filter = ('status', 'scheduled_at')
    search_fields = ('subject__name', 'tutor__user__email', 'parent__user__email')

@admin.register(SessionLog)
class SessionLogAdmin(admin.ModelAdmin):
    list_display = ('session', 'action', 'actor_type', 'timestamp')
    list_filter = ('actor_type', 'action')

@admin.register(SessionNote)
class SessionNoteAdmin(admin.ModelAdmin):
    list_display = ('session', 'tutor', 'student_performance', 'created_at')
    list_filter = ('student_performance',)

@admin.register(SessionTopic)
class SessionTopicAdmin(admin.ModelAdmin):
    list_display = ('session', 'topic')
    search_fields = ('topic__name',)
    