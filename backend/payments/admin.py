from django.contrib import admin
from .models import Payment, Payout, Dispute

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('provider_reference', 'amount', 'status', 'initiated_at')
    list_filter = ('status', 'provider')

@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ('tutor', 'amount', 'status', 'scheduled_date')
    list_filter = ('status', 'scheduled_date')

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ('session', 'raised_by_type', 'status', 'created_at')
    list_filter = ('status',)
