from rest_framework.authentication import SessionAuthentication


class SessionAuthentication401(SessionAuthentication):
    """SessionAuthentication that returns 401 (not DRF's default 403) when
    unauthenticated, without opening a second auth mechanism like Basic Auth."""

    def authenticate_header(self, request):
        return "Session"
