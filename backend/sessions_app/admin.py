from django.contrib import admin
from .models import Session, SessionLog


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'tutor', 'parent', 'scheduled_at', 'status')
    list_filter = ('status',)
    search_fields = ('subject', 'tutor__user__email', 'parent__user__email')
    ordering = ('-created_at',)


@admin.register(SessionLog)
class SessionLogAdmin(admin.ModelAdmin):
    list_display = ('session', 'action', 'actor_type', 'timestamp')
    list_filter = ('actor_type',)
    ordering = ('-timestamp',)
