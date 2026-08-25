from collections import defaultdict
from datetime import date

from rest_framework import viewsets, permissions, decorators, response
from django.db.models import Q

from .models import (
    Department, Section, Designation, DailyEntry, Announcement,
    Feedback, EmployeeAssignment,
)
from .serializers import (
    DepartmentSerializer, SectionSerializer, DesignationSerializer,
    DailyEntrySerializer, AnnouncementSerializer, FeedbackSerializer,
    EmployeeAssignmentSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Anyone authenticated can read/list; only Admin group / staff can write
    to Department, Section, Designation (renaming/customizing structure)."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and (request.user.is_staff or request.user.groups.filter(name="Admin").exists())


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related("department").all()
    serializer_class = SectionSerializer
    permission_classes = [IsAdminOrReadOnly]

    @decorators.action(detail=True, methods=["get"])
    def evaluation(self, request, pk=None):
        """Auto weekly/monthly/quarterly/half-yearly/yearly rollup for a section."""
        section = self.get_object()
        entries = DailyEntry.objects.filter(designation__section=section)
        return response.Response(_evaluate(entries))


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.select_related("section").all()
    serializer_class = DesignationSerializer
    permission_classes = [IsAdminOrReadOnly]

    @decorators.action(detail=True, methods=["get"])
    def evaluation(self, request, pk=None):
        designation = self.get_object()
        entries = DailyEntry.objects.filter(designation=designation)
        return response.Response(_evaluate(entries))


class DailyEntryViewSet(viewsets.ModelViewSet):
    """Employees can only create/see entries for their own assigned designation.
    Admin sees & edits everything."""
    serializer_class = DailyEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = DailyEntry.objects.select_related("designation").prefetch_related("documents")
        if user.is_staff or user.groups.filter(name="Admin").exists():
            return qs
        try:
            assignment = user.rizvi_assignment
            return qs.filter(designation=assignment.designation)
        except EmployeeAssignment.DoesNotExist:
            return qs.none()

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FeedbackViewSet(viewsets.ModelViewSet):
    """Employees submit; Admin sees all; employees see only their own."""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Feedback.objects.all()
        if user.is_staff or user.groups.filter(name="Admin").exists():
            return qs
        return qs.filter(submitted_by=user)

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)


class MasterDashboardView(viewsets.ViewSet):
    """GET /api/rizviworld/dashboard/ -> summary + bubble-chart data for all 39 sections."""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        sections = Section.objects.all()
        bubbles = []
        for sec in sections:
            entries = DailyEntry.objects.filter(designation__section=sec)
            avg = _avg_percent(entries)
            bubbles.append({
                "section_id": sec.id, "name": sec.name,
                "avg": avg, "designation_count": sec.designations.count(),
                "status": _status(avg) if avg is not None else "grey",
            })
        overall_vals = [b["avg"] for b in bubbles if b["avg"] is not None]
        overall = round(sum(overall_vals) / len(overall_vals)) if overall_vals else 0
        return response.Response({
            "departments": Department.objects.count(),
            "sections": Section.objects.count(),
            "designations": Designation.objects.count(),
            "overall_avg": overall,
            "bubbles": bubbles,
        })


# ---------------- helpers ----------------

def _pct(entry):
    return round((entry.achieved / entry.target) * 100) if entry.target else 0


def _status(p):
    return "green" if p >= 95 else "yellow" if p >= 80 else "red"


def _avg_percent(entries):
    vals = [_pct(e) for e in entries]
    return round(sum(vals) / len(vals)) if vals else None


def _period_key(d: date, period: str):
    if period == "daily":
        return d.isoformat()
    if period == "weekly":
        # Saturday-start week (RMG_ERP convention)
        offset = (d.weekday() + 2) % 7  # Mon=0 ... make Saturday the start
        from datetime import timedelta
        sat = d - timedelta(days=offset)
        return sat.isoformat()
    if period == "monthly":
        return f"{d.year}-{d.month:02d}"
    if period == "quarterly":
        return f"{d.year}-Q{(d.month-1)//3+1}"
    if period == "halfyearly":
        return f"{d.year}-H{1 if d.month <= 6 else 2}"
    if period == "yearly":
        return f"{d.year}"


def _evaluate(entries):
    out = {}
    for period in ["weekly", "monthly", "quarterly", "halfyearly", "yearly"]:
        groups = defaultdict(list)
        for e in entries:
            groups[_period_key(e.date, period)].append(_pct(e))
        out[period] = [
            {"period": k, "avg": round(sum(v) / len(v)), "count": len(v), "status": _status(round(sum(v) / len(v)))}
            for k, v in sorted(groups.items(), reverse=True)
        ]
    return out
