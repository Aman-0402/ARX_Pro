from rest_framework.permissions import BasePermission


class HasExamSession(BasePermission):
    """Candidate must have completed /api/exam/register/ in this session,
    mirroring the original PHP $_SESSION['candidate_id'] gate."""

    def has_permission(self, request, view):
        return bool(request.session.get("exam_candidate_id"))
