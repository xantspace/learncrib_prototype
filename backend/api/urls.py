from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    UserViewSet,
    TutorViewSet,
    SessionViewSet,
    PaymentViewSet,
    PayoutViewSet,
    ReviewViewSet,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'tutors', TutorViewSet, basename='tutor')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payouts', PayoutViewSet, basename='payout')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # ── Auth Endpoints ──────────────────────────────
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ── API Resources ───────────────────────────────
    path('', include(router.urls)),
]
