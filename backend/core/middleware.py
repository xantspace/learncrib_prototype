import base64
import re
from django.http import JsonResponse

class BotProtectionMiddleware:
    """
    Blocks automated scripts (bots, scrapers) by requiring a specific Base64-encoded 
    client fingerprint generated securely by the React frontend.
    """
    
    # Paths that bypass bot protection (webhooks, admin, schema)
    EXEMPT_PATHS = [
        '/admin/', 
        '/api/schema/', 
        '/api/payouts/webhook/', # Example Webhook bypass
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        
        # Bypass for certain paths
        if any(path.startswith(exempt) for exempt in self.EXEMPT_PATHS):
            return self.get_response(request)

        # Only protect API endpoints
        if path.startswith('/api/'):
            fingerprint = request.headers.get('X-Client-Fingerprint')
            
            if not fingerprint:
                return JsonResponse(
                    {'detail': 'Access Denied: Missing client signature. Automated scraping is prohibited.'}, 
                    status=403
                )
            
            try:
                # Decode the base64 fingerprint provided by the frontend
                decoded_bytes = base64.b64decode(fingerprint)
                decoded_str = decoded_bytes.decode('utf-8')
                
                # Expected format: [WIDTH]x[HEIGHT]-lc2026-[LANG]
                # Example: 1536x706-lc2026-en-US
                pattern = r'^\d{3,4}x\d{3,4}-lc2026-[a-zA-Z-]+$'
                if not re.match(pattern, decoded_str):
                    return JsonResponse(
                        {'detail': 'Access Denied: Invalid security fingerprint format.'}, 
                        status=403
                    )
            except Exception:
                # Catch decoding errors or malformed base64
                return JsonResponse(
                    {'detail': 'Access Denied: Security signature verification failed.'}, 
                    status=403
                )

        # Proceed normally if fingerprint is valid
        response = self.get_response(request)
        return response
