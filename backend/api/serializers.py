from rest_framework import serializers
from users.models import User, ParentProfile, TutorProfile, Student
from sessions_app.models import Session, SessionLog
from payments.models import Payment, Payout, Dispute
from reviews.models import Review


# ─── User & Profile Serializers ───────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """Used during signup — accepts password, writes it securely."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'role']

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Cannot register as an administrator via the public API.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name', 'grade_level', 'created_at']
        read_only_fields = ['id', 'created_at']


class TutorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TutorProfile
        fields = [
            'id', 'user', 'bio', 'subjects', 'hourly_rate',
            'latitude', 'longitude', 'is_available',
            'rating', 'total_reviews', 'verification_status',
        ]
        read_only_fields = ['id', 'rating', 'total_reviews', 'verification_status']


class ParentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    students = StudentSerializer(many=True, read_only=True)

    class Meta:
        model = ParentProfile
        fields = ['id', 'user', 'students', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─── Session Serializers ───────────────────────────────────────────────────────

class SessionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionLog
        fields = ['id', 'action', 'actor_type', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class SessionSerializer(serializers.ModelSerializer):
    """Full read serializer — includes nested details."""
    tutor = TutorProfileSerializer(read_only=True)
    logs = SessionLogSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'parent', 'student', 'tutor',
            'subject', 'status', 'scheduled_at', 'notes',
            'created_at', 'updated_at', 'logs',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class SessionCreateSerializer(serializers.ModelSerializer):
    """Write serializer — parent books a session."""
    class Meta:
        model = Session
        fields = ['student', 'tutor', 'subject', 'scheduled_at', 'notes']

    def validate_tutor(self, tutor):
        if tutor.verification_status != TutorProfile.VerificationStatus.APPROVED:
            raise serializers.ValidationError("This tutor is not yet approved.")
        if not tutor.is_available:
            raise serializers.ValidationError("This tutor is not currently available.")
        return tutor


class SessionStatusUpdateSerializer(serializers.ModelSerializer):
    """Used by tutors to accept/reject, or by system to complete."""
    class Meta:
        model = Session
        fields = ['status']

    def validate_status(self, value):
        allowed = [Session.Status.ACCEPTED, Session.Status.REJECTED, Session.Status.CANCELLED]
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {allowed}")
        return value


# ─── Payment Serializers ───────────────────────────────────────────────────────

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'session', 'parent', 'amount',
            'provider', 'provider_reference', 'status',
            'initiated_at', 'completed_at',
        ]
        read_only_fields = ['id', 'initiated_at', 'completed_at', 'status']


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = [
            'id', 'tutor', 'session', 'amount',
            'status', 'scheduled_date', 'processed_at',
        ]
        read_only_fields = ['id', 'processed_at']


class DisputeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = ['id', 'session', 'raised_by_type', 'reason', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


# ─── Review Serializers ────────────────────────────────────────────────────────

class ReviewSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'booking', 'student', 'tutor', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
