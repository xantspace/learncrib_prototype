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
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
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


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class AuthMeView(generics.RetrieveUpdateAPIView):
    """GET /api/auth/me/ and PATCH /api/users/me/ equivalent"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.GenericAPIView):
    """POST /api/auth/change-password/"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        
        if not old_password or not new_password:
            return Response({"detail": "old_password and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not user.check_password(old_password):
            return Response({"detail": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully."})



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

    @action(detail=False, methods=['patch'])
    def me(self, request):
        """PATCH /api/users/me/"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='payment-methods')
    def payment_methods(self, request):
        """GET /api/users/payment-methods/"""
        return Response([])

    @action(detail=False, methods=['get'], url_path='bank-account')
    def bank_account(self, request):
        """GET /api/users/bank-account/"""
        return Response({})


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

        max_rate = self.request.query_params.get('max_rate')
        if max_rate:
            qs = qs.filter(hourly_rate__lte=max_rate)

        return qs

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """GET /api/users/tutors/nearby/ — find tutors within range."""
        # For now, just return all approved tutors (we can add geo-filtering later)
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


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

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """POST /api/sessions/{id}/accept/"""
        session = self.get_object()
        if request.user.role != User.Role.TUTOR or session.tutor.user != request.user:
            return Response({'detail': 'Only the assigned tutor can accept.'}, status=status.HTTP_403_FORBIDDEN)
        session.status = Session.Status.ACCEPTED
        session.save()
        SessionLog.objects.create(session=session, action='ACCEPTED', actor_type='TUTOR')
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """POST /api/sessions/{id}/reject/"""
        session = self.get_object()
        if request.user.role != User.Role.TUTOR or session.tutor.user != request.user:
            return Response({'detail': 'Only the assigned tutor can reject.'}, status=status.HTTP_403_FORBIDDEN)
        session.status = Session.Status.REJECTED
        session.save()
        SessionLog.objects.create(session=session, action='REJECTED', actor_type='TUTOR')
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """POST /api/sessions/{id}/complete/"""
        session = self.get_object()
        # Usually triggered by tutor after session or auto-job
        session.status = Session.Status.COMPLETED
        session.save()
        SessionLog.objects.create(session=session, action='COMPLETED', actor_type='SYSTEM')
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """POST /api/sessions/{id}/cancel/"""
        session = self.get_object()
        reason = request.data.get('reason', 'No reason provided')
        session.status = Session.Status.CANCELLED
        session.notes = f"{session.notes}\nCancellation Reason: {reason}"
        session.save()
        actor = 'TUTOR' if request.user.role == User.Role.TUTOR else 'PARENT'
        SessionLog.objects.create(session=session, action='CANCELLED', actor_type=actor)
        return Response(SessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """POST /api/sessions/{id}/confirm/"""
        session = self.get_object()
        # Parent confirms everything is okay
        SessionLog.objects.create(session=session, action='CONFIRMED_BY_PARENT', actor_type='PARENT')
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

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """POST /api/payments/initiate/"""
        session_id = request.data.get('session_id')
        amount = request.data.get('amount', 5000) # Default mock fallback
        
        if not session_id:
            return Response({"detail": "session_id required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from sessions_app.models import Session
            booking = Session.objects.get(id=session_id)
        except Exception:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
            
        import uuid
        reference = f"PS_{uuid.uuid4().hex[:10]}"
        
        Payment.objects.create(
            session=booking,
            parent=request.user,
            amount=amount,
            provider='paystack',
            provider_reference=reference,
            status=Payment.Status.PENDING
        )
        
        return Response({
            "checkout_url": f"https://checkout.paystack.com/{reference}", 
            "reference": reference
        })

    @action(detail=False, methods=['get'], url_path='verify/(?P<ref>[^/.]+)')
    def verify(self, request, ref=None):
        """GET /api/payments/verify/:ref/"""
        try:
            payment = Payment.objects.get(provider_reference=ref)
            payment.status = Payment.Status.SUCCESSFUL
            payment.save()
            return Response({"status": "success", "message": f"Payment verified (ref: {ref})", "payment_id": payment.id})
        except Payment.DoesNotExist:
            return Response({"status": "failed", "detail": "Invalid payment reference"}, status=status.HTTP_404_NOT_FOUND)


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

    @action(detail=False, methods=['get'])
    def earnings(self, request):
        """GET /api/payouts/earnings/"""
        user = request.user
        if user.role != User.Role.TUTOR:
            return Response({"detail": "Only tutors can view earnings."}, status=status.HTTP_403_FORBIDDEN)
            
        from django.db.models import Sum
        tutor_profile = user.tutor_profile
        
        total_e = Payout.objects.filter(
            tutor=tutor_profile, status=Payout.Status.PROCESSED
        ).aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        pending_p = Payout.objects.filter(
            tutor=tutor_profile, status=Payout.Status.SCHEDULED
        ).aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        return Response({
            "total_earnings": str(total_e),
            "pending_payouts": str(pending_p),
            "available_balance": str(pending_p)
        })


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
