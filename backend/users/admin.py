from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ParentProfile, Student, TutorProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Roles & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'last_active_at')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
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
    