import base64
import uuid

def obfuscate_id(uid):
    """
    Transforms a UUID into a URL-friendly, non-obvious string.
    Example: '550e8400-e29b-... ' -> 'xY7bP9k...'
    """
    if not isinstance(uid, uuid.UUID):
        try:
            uid = uuid.UUID(str(uid))
        except:
            return str(uid)
            
    # Convert UUID bytes to base64 and pick a clean slice
    # This is a one-way-ish obfuscation for display, or we store the slug.
    # For a real system, we save 'slug' in the DB. 
    # Let's create a deterministic slug generator for now.
    raw = uid.bytes
    encoded = base64.urlsafe_b64encode(raw).decode('utf-8').rstrip('=')
    return encoded

def deobfuscate_id(slug):
    """
    Reverses the obfuscated string back to a UUID.
    """
    try:
        # Standardize length for base64
        missing_padding = len(slug) % 4
        if missing_padding:
            slug += '=' * (4 - missing_padding)
        raw = base64.urlsafe_b64decode(slug)
        return uuid.UUID(bytes=raw)
    except:
        return None
