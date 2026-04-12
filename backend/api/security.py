import logging
from functools import wraps
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)
signer = TimestampSigner()

def generate_action_token(user, action_name):
    """
    Generates a secure, cryptographically signed token bound to a specific user and action.
    """
    payload = f"{user.id}:{action_name}"
    return signer.sign(payload)

def verify_action_token(user, action_name, token, max_age=300):
    """
    Verifies the token is valid, hasn't expired (default 5 mins), 
    and belongs to the exact user attempting the action.
    """
    try:
        payload = signer.unsign(token, max_age=max_age)
        expected_payload = f"{user.id}:{action_name}"
        if payload != expected_payload:
            return False
        return True
    except SignatureExpired:
        logger.warning(f"Action token expired for user {user.id} on action {action_name}")
        return False
    except BadSignature:
        logger.warning(f"Invalid or tampered action token from user {user.id} on action {action_name}")
        return False

def require_action_token(action_name):
    """
    DRF View Decorator to require a valid cryptographically signed token 
    before executing the view method. 
    Expects header: X-Action-Token
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(viewset_instance, request, *args, **kwargs):
            token = request.headers.get('X-Action-Token')
            
            if not token:
                return Response(
                    {"detail": "Critical Action Protocol: Missing required action token."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verify the token
            if not verify_action_token(request.user, action_name, token):
                return Response(
                    {"detail": "Critical Action Protocol: Invalid, expired, or stolen token."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            return view_func(viewset_instance, request, *args, **kwargs)
        return _wrapped_view
    return decorator
