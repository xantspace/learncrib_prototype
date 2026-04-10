from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TutorViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'tutors', TutorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
