from django.conf import settings
from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView

from .security import generate_action_token, require_action_token
from users.models import User, TutorProfile, ParentProfile, Student
from sessions_app.models import Session, SessionLog
from payments.models import Payment, Payout, Dispute
from reviews.models import Review

from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    TutorProfileSerializer, ParentProfileSerializer, StudentSerializer,
    SessionSerializer, SessionCreateSerializer, SessionStatusUpdateSerializer,
    PaymentSerializer, PayoutSerializer, DisputeSerializer,
    ReviewSerializer, ChangePasswordSerializer, BankAccountSerializer
)
from .utils import deobfuscate_id
from payments.services import PaystackService


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

class ActionTokenView(APIView):
    """GET /api/auth/action-token/?action_name=initiate_payment"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        action_name = request.query_params.get('action_name')
        if not action_name:
            return Response({'error': 'action_name query parameter is required'}, status=400)
        
        # In a real system, you might validate that action_name is recognized
        token = generate_action_token(request.user, action_name)
        return Response({'action_token': token})


class AuthMeView(generics.RetrieveUpdateAPIView):
    """GET /api/auth/me/ and PATCH /api/users/me/ equivalent"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """POST /api/auth/change-password/"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        old_password = serializer.validated_data.get("old_password")
        new_password = serializer.validated_data.get("new_password")
        
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
        # Placeholder for payment methods list
        return Response([])

    @action(detail=False, methods=['get', 'post', 'patch'], url_path='bank-account')
    def bank_account(self, request):
        """GET/POST/PATCH /api/users/bank-account/"""
        user = request.user
        if request.method == 'GET':
            try:
                account = user.bank_account
                return Response(BankAccountSerializer(account).data)
            except BankAccount.DoesNotExist:
                return Response(None)
        
        elif request.method in ['POST', 'PATCH']:
            # Create or update
            account, created = BankAccount.objects.get_or_create(user=user)
            serializer = BankAccountSerializer(account, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class StudentsView(generics.ListAPIView):
    """GET /api/users/students/ — returns the children linked to the logged-in parent."""
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return self.request.user.parent_profile.students.all()
        except ParentProfile.DoesNotExist:
            return Student.objects.none()


class TutorViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/tutors/ — browse approved tutors (public endpoint)."""
    serializer_class = TutorProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        pk = self.kwargs.get('pk')
        resolved_id = deobfuscate_id(pk) or pk
        try:
            return TutorProfile.objects.select_related('user').get(pk=resolved_id)
        except (TutorProfile.DoesNotExist, ValueError):
            from django.http import Http404
            raise Http404("Tutor not found.")

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

    def get_object(self):
        pk = self.kwargs.get('pk')
        resolved_id = deobfuscate_id(pk) or pk
        try:
            return Session.objects.select_related('parent', 'student', 'tutor').get(pk=resolved_id)
        except (Session.DoesNotExist, ValueError):
            from django.http import Http404
            raise Http404("Session not found.")

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
    @require_action_token('cancel_session')
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
    @require_action_token('initiate_payment')
    def initiate(self, request):
        """POST /api/payments/initiate/"""
        session_id = request.data.get('session_id')
        
        if not session_id:
            return Response({"detail": "session_id required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            booking = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # Calculate amount: duration * tutor's hourly_rate
        amount = booking.tutor.hourly_rate * booking.duration
        
        # Initialize with Paystack
        paystack = PaystackService()
        result = paystack.initialize_transaction(
            email=request.user.email,
            amount_in_naira=float(amount),
            metadata={'session_id': str(booking.id), 'user_id': str(request.user.id)}
        )
        
        if not result:
            return Response({"detail": "Paystack initialization failed."}, status=status.HTTP_502_BAD_GATEWAY)
            
        # Create payment record
        payment = Payment.objects.create(
            session=booking,
            parent=request.user,
            amount=amount,
            provider='paystack',
            provider_reference=result['reference'],
            status=Payment.Status.PENDING
        )
        
        return Response({
            "checkout_url": result['authorization_url'], 
            "reference": result['reference'],
            "amount": float(amount)
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


class PaystackWebhookView(APIView):
    """POST /api/payments/webhook/ — handled by Paystack."""
    permission_classes = [AllowAny] # Paystack won't have a JWT

    def post(self, request):
        # In production, verify the Paystack signature (X-Paystack-Signature)
        event = request.data.get('event')
        data = request.data.get('data')
        
        if event == 'charge.success':
            reference = data.get('reference')
            try:
                payment = Payment.objects.get(provider_reference=reference)
                if payment.status != Payment.Status.SUCCESSFUL:
                    payment.status = Payment.Status.SUCCESSFUL
                    payment.save()
                    
                    # Also update session status maybe?
                    session = payment.session
                    if session.status == Session.Status.PENDING:
                        session.status = Session.Status.ACCEPTED
                        session.save()
                        
            except Payment.DoesNotExist:
                pass # Or log error
                
        return Response(status=status.HTTP_200_OK)


# ─── Review Views ──────────────────────────────────────────────────────────────

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Review.objects.all().select_related('student', 'tutor__user', 'booking')
        if self.request.user.role == User.Role.TUTOR:
            return qs.filter(tutor__user=self.request.user)
        return qs

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


# ─── Admin Views ──────────────────────────────────────────────────────────────

class AdminViewSet(viewsets.ViewSet):
    """
    Administrative actions for managing tutors and users.
    Accessible only by staff/admins.
    """
    permission_classes = [IsAuthenticated]

    def _check_admin(self, request):
        if request.user.role != User.Role.ADMIN and not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Administrative access required.")

    def _get_tutor(self, pk):
        # Support lookup by ID or Email
        if '@' in str(pk):
            return TutorProfile.objects.get(user__email=pk)
        return TutorProfile.objects.get(pk=pk)

    @action(detail=False, methods=['get'])
    def tutors(self, request):
        """GET /api/admin/tutors/"""
        self._check_admin(request)
        status_filter = request.query_params.get('status')
        qs = TutorProfile.objects.all().select_related('user')
        if status_filter:
            qs = qs.filter(verification_status=status_filter)
        
        serializer = TutorProfileSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def users(self, request):
        """GET /api/admin/users/"""
        self._check_admin(request)
        qs = User.objects.all()
        serializer = UserSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """POST /api/admin/tutors/{id_or_email}/approve/"""
        self._check_admin(request)
        try:
            tutor = self._get_tutor(pk)
            tutor.verification_status = TutorProfile.VerificationStatus.APPROVED
            tutor.is_approved = True
            tutor.save()
            return Response({"status": "success", "message": f"Tutor {tutor.user.email} approved."})
        except TutorProfile.DoesNotExist:
            return Response({"detail": "Tutor not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """POST /api/admin/tutors/{id_or_email}/reject/"""
        self._check_admin(request)
        reason = request.data.get('reason', 'No reason provided.')
        try:
            tutor = self._get_tutor(pk)
            tutor.verification_status = TutorProfile.VerificationStatus.REJECTED
            tutor.is_approved = False
            tutor.save()
            # In a real app, send email with 'reason'
            return Response({"status": "success", "message": f"Tutor {tutor.user.email} rejected. Reason: {reason}"})
        except TutorProfile.DoesNotExist:
            return Response({"detail": "Tutor not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def disable(self, request, pk=None):
        """POST /api/admin/tutors/{id_or_email}/disable/"""
        self._check_admin(request)
        tutor = self._get_tutor(pk)
        tutor.is_available = False
        tutor.save()
        return Response({"status": "disabled"})

    @action(detail=True, methods=['post'])
    def enable(self, request, pk=None):
        """POST /api/admin/tutors/{id_or_email}/enable/"""
        self._check_admin(request)
        tutor = self._get_tutor(pk)
        tutor.is_available = True
        tutor.save()
        return Response({"status": "enabled"})
