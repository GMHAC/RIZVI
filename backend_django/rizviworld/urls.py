from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, SectionViewSet, DesignationViewSet, DailyEntryViewSet,
    AnnouncementViewSet, FeedbackViewSet, MasterDashboardView,
)

router = DefaultRouter()
router.register("departments", DepartmentViewSet)
router.register("sections", SectionViewSet)
router.register("designations", DesignationViewSet)
router.register("entries", DailyEntryViewSet, basename="entries")
router.register("announcements", AnnouncementViewSet)
router.register("feedback", FeedbackViewSet, basename="feedback")
router.register("dashboard", MasterDashboardView, basename="dashboard")

urlpatterns = router.urls

# In your project's main urls.py add:
#   path("api/rizviworld/", include("apps.rizviworld.urls")),
