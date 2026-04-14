from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    UserViewSet,
    TutorViewSet,
    SessionViewSet,
    PaymentViewSet,
    PayoutViewSet,
    ReviewViewSet,
    CustomTokenObtainPairView,
    ActionTokenView,
    AuthMeView,
    ChangePasswordView,
    AdminViewSet,
    StudentsView,
    PaystackWebhookView,
)

router = DefaultRouter()
# Register more specific paths FIRST to avoid shadowing
router.register(r'admin', AdminViewSet, basename='admin')
router.register(r'users/tutors', TutorViewSet, basename='tutor')
router.register(r'users', UserViewSet, basename='user')

router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payouts', PayoutViewSet, basename='payout')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # ── Auth Endpoints ──────────────────────────────
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/action-token/', ActionTokenView.as_view(), name='action_token'),
    path('auth/me/', AuthMeView.as_view(), name='auth_me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/students/', StudentsView.as_view(), name='students_list'),
    path('payments/webhook/', PaystackWebhookView.as_view(), name='paystack_webhook'),

    # ── API Resources ───────────────────────────────
    path('', include(router.urls)),
]
