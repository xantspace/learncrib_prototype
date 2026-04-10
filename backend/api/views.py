from rest_framework import viewsets
from users.models import User, TutorProfile
from .serializers import UserSerializer, TutorProfileSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TutorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TutorProfile.objects.filter(verification_status='approved')
    serializer_class = TutorProfileSerializer
