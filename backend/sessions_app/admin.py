from django.contrib import admin
from .models import Session, SessionLog

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'tutor', 'parent', 'scheduled_date', 'status')
    list_filter = ('status', 'scheduled_date')
    search_fields = ('subject', 'tutor__user__email', 'parent__user__email')

@admin.register(SessionLog)
class SessionLogAdmin(admin.ModelAdmin):
    list_display = ('session', 'action', 'actor_type', 'timestamp')
    list_filter = ('actor_type', 'timestamp')
