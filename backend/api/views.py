from django.conf import settings
from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.models import User, TutorProfile, ParentProfile, Student
from sessions_app.models import Session, SessionLog
from payments.models import Payment, Payout, Dispute
from reviews.models import Review

from .serializers import (
    UserSerializer, RegisterSerializer,
    TutorProfileSerializer, ParentProfileSerializer, StudentSerializer,
    SessionSerializer, SessionCreateSerializer, SessionStatusUpdateSerializer,
    PaymentSerializer, PayoutSerializer, DisputeSerializer,
    ReviewSerializer,
)


# ─── Auth Views ────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a new user account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Auto-create profile based on role
        if user.role == User.Role.STUDENT:
            ParentProfile.objects.create(user=user)
        elif user.role == User.Role.TUTOR:
            TutorProfile.objects.create(user=user, hourly_rate=0)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


# ─── User Views ────────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Non-admins can only see themselves
        if self.request.user.role == User.Role.ADMIN:
            return User.objects.all()
        return User.objects.filter(pk=self.request.user.pk)


class TutorViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/tutors/ — browse approved tutors (public endpoint)."""
    serializer_class = TutorProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = TutorProfile.objects.filter(
            verification_status=TutorProfile.VerificationStatus.APPROVED,
            is_available=True,
        ).select_related('user')

        # Optional filters from query params
        subject = self.request.query_params.get('subject')
        if subject:
            qs = qs.filter(subjects__icontains=subject)

        return qs


# ─── Session Views ─────────────────────────────────────────────────────────────

class SessionViewSet(viewsets.ModelViewSet):
    """
    Core booking endpoint.
    - Parents: create sessions, view their own sessions.
    - Tutors:  view their sessions, accept/reject.
    - Admin:   full access.
    """
    queryset = Session.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return SessionCreateSerializer
        if self.action == 'update_status':
            return SessionStatusUpdateSerializer
        return SessionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Session.objects.all().select_related('parent', 'student', 'tutor')
        if user.role == User.Role.TUTOR:
            return Session.objects.filter(tutor__user=user).select_related('parent', 'student', 'tutor')
        # STUDENT role = parent
        return Session.objects.filter(parent__user=user).select_related('parent', 'student', 'tutor')

    def perform_create(self, serializer):
        parent_profile = self.request.user.parent_profile
        session = serializer.save(parent=parent_profile)
        # Log the creation
        SessionLog.objects.create(
            session=session,
            action='SESSION_REQUESTED',
            actor_type='PARENT',
        )

    @action(detail=True, methods=['patch'], url_path='status')
    def status(self, request, pk=None):
        """PATCH /api/sessions/{id}/status/ — tutor accepts/rejects."""
        session = self.get_object()
        
        # Security: Only the assigned tutor can accept/reject a requested session
        if request.user.role == User.Role.TUTOR and session.tutor.user != request.user:
            return Response({'detail': 'You are not the tutor for this session.'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = SessionStatusUpdateSerializer(session, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        session.status = new_status
        session.save()

        actor = 'TUTOR' if request.user.role == User.Role.TUTOR else 'PARENT'
        SessionLog.objects.create(
            session=session,
            action=f'STATUS_CHANGED_TO_{new_status}',
            actor_type=actor,
        )
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'], url_path='dispute')
    def dispute(self, request, pk=None):
        """POST /api/sessions/{id}/dispute/ — raise a dispute."""
        session = self.get_object()
        
        # Security: Only participants can raise a dispute
        if session.parent.user != request.user and session.tutor.user != request.user:
            return Response({'detail': 'You are not a participant in this session.'}, status=status.HTTP_403_FORBIDDEN)

        if hasattr(session, 'dispute'):
            return Response({'detail': 'A dispute already exists for this session.'}, status=status.HTTP_400_BAD_REQUEST)
        actor = 'PARENT' if hasattr(request.user, 'parent_profile') else 'TUTOR'
        dispute = Dispute.objects.create(
            session=session,
            raised_by_type=actor,
            reason=request.data.get('reason', ''),
        )
        return Response(DisputeSerializer(dispute).data, status=status.HTTP_201_CREATED)


# ─── Payment Views ─────────────────────────────────────────────────────────────

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only — payment records are created by the Paystack webhook."""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Payment.objects.all()
        return Payment.objects.filter(parent__user=user)


class PayoutViewSet(viewsets.ReadOnlyModelViewSet):
    """Tutors view their own payouts."""
    queryset = Payout.objects.all()
    serializer_class = PayoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Payout.objects.all()
        return Payout.objects.filter(tutor__user=user)


# ─── Review Views ──────────────────────────────────────────────────────────────

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            tutor__user=self.request.user
        ).select_related('student', 'tutor') if self.request.user.role == User.Role.TUTOR else \
        Review.objects.all()

    def perform_create(self, serializer):
        # Security check: Session must be completed to leave a review
        booking = serializer.validated_data['booking']
        if booking.status != Session.Status.COMPLETED:
            from rest_framework import serializers
            raise serializers.ValidationError("Reviews can only be left for completed sessions.")
        
        # Security check: Only the parent who booked the session can review
        if booking.parent.user != self.request.user:
            from rest_framework import serializers
            raise serializers.ValidationError("You can only review sessions you booked.")

        serializer.save(student=self.request.user)
