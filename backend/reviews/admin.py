from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('tutor', 'student', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('tutor__user__email', 'student__email')
    ordering = ('-created_at',)
