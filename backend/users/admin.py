from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ParentProfile, Student, TutorProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Role & Permissions', {'fields': ('role', 'is_staff', 'is_superuser', 'is_active')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'role'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__email',)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'parent', 'grade_level')
    list_filter = ('grade_level',)
    search_fields = ('first_name', 'last_name', 'parent__user__email')


@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'hourly_rate', 'verification_status', 'is_available', 'rating')
    list_filter = ('verification_status', 'is_available')
    search_fields = ('user__email',)
