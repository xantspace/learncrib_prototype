from django.contrib import admin
from .models import AIEvent


@admin.register(AIEvent)
class AIEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'event_type', 'category', 'created_at']
    list_filter = ['category', 'event_type']
    search_fields = ['event_type', 'user__email']
    readonly_fields = ['id', 'created_at']
