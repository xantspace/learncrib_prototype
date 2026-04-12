import hashlib
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

class FingerprintVerificationMiddleware:
    """
    Middleware that verifies the browser fingerprint stored in the JWT claims
    against the actual fingerprint of the incoming request.
    Prevents session hijacking even if the access token is stolen.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # We only check authenticated requests that use JWT
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                # Manually authenticate to get the token claims
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(auth_header.split(' ')[1])
                
                # Extract expected fingerprint hash from JWT
                expected_hash = validated_token.get('fp_hash')
                
                if expected_hash:
                    # Generate current request fingerprint hash
                    current_fp = self.generate_fingerprint_string(request)
                    current_hash = hashlib.sha256(current_fp.encode()).hexdigest()
                    
                    if current_hash != expected_hash:
                        return JsonResponse(
                            {'detail': 'Session identity mismatch. Security violation detected.'},
                            status=status.HTTP_401_UNAUTHORIZED
                        )
            except (InvalidToken, AuthenticationFailed):
                # Let the DRF authentication handle invalid tokens normally
                pass
            except Exception as e:
                # Log error or silence to avoid breaking the app
                pass

        return self.get_response(request)

    def generate_fingerprint_string(self, request):
        """
        Creates a raw fingerprint string from request metadata.
        Standard Google-like components: User-Agent, Language, Platform.
        """
        ua = request.headers.get('User-Agent', 'unknown')
        lang = request.headers.get('Accept-Language', 'unknown')
        # Custom header sent by our frontend
        device_id = request.headers.get('X-Device-Id', 'unknown')
        
        return f"{ua}|{lang}|{device_id}"
