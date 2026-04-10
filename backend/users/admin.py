from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ParentProfile, Student, TutorProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_parent', 'is_tutor', 'is_staff')
    list_filter = ('is_parent', 'is_tutor', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Roles', {'fields': ('phone', 'is_parent', 'is_tutor')}),
    )
    ordering = ('email',)

@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'parent', 'grade_level')
    list_filter = ('grade_level',)

@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'hourly_rate', 'verification_status', 'created_at')
    list_filter = ('verification_status',)
    search_fields = ('user__email',)
