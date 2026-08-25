"""
RIZVIWORLD — Django backend models
Mirrors the frontend data model (Department -> Section -> Designation -> Entry)
so the RIZVIWORLD_ROOT_INDEX.html frontend can be pointed at a real, multi-user,
multi-device (web / mobile / tablet / smart TV) live API instead of localStorage.

Add this app to an existing Django project (e.g. inside RMG_ERP) as:
    apps/rizviworld/
"""
from django.conf import settings
from django.db import models


class Department(models.Model):
    """15 top-level departments (Cutting, Sewing, Finishing, QA/QC, etc.)"""
    name = models.CharField(max_length=150, unique=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class Section(models.Model):
    """39 sections, each belongs to one department."""
    department = models.ForeignKey(Department, related_name="sections", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("department", "name")

    def __str__(self):
        return f"{self.name} ({self.department.name})"


class Designation(models.Model):
    """247 designations, each belongs to one section."""
    section = models.ForeignKey(Section, related_name="designations", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class EmployeeAssignment(models.Model):
    """Links a system user to exactly one designation (their job)."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rizvi_assignment")
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, related_name="employees")
    employee_id = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return f"{self.employee_id} -> {self.designation}"


class DailyEntry(models.Model):
    """One daily task-log entry for a designation: target/achieved/note + media."""
    designation = models.ForeignKey(Designation, related_name="entries", on_delete=models.CASCADE)
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    task = models.TextField(blank=True)
    target = models.PositiveIntegerField(default=0)
    achieved = models.PositiveIntegerField(default=0)
    note = models.TextField(blank=True, help_text="ব্যর্থ হলে কারণ")
    voice_file = models.FileField(upload_to="rizviworld/voice/%Y/%m/", blank=True, null=True)
    video_file = models.FileField(upload_to="rizviworld/video/%Y/%m/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["designation", "date"])]
        ordering = ["-date"]

    @property
    def percent(self):
        return round((self.achieved / self.target) * 100) if self.target else 0

    @property
    def status(self):
        p = self.percent
        return "green" if p >= 95 else "yellow" if p >= 80 else "red"

    def __str__(self):
        return f"{self.designation} — {self.date} ({self.percent}%)"


class EntryDocument(models.Model):
    """Any-format document attachments for a DailyEntry (multiple allowed)."""
    entry = models.ForeignKey(DailyEntry, related_name="documents", on_delete=models.CASCADE)
    file = models.FileField(upload_to="rizviworld/docs/%Y/%m/")
    original_name = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Announcement(models.Model):
    """Management broadcast shown on every user's dashboard."""
    text = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Feedback(models.Model):
    """Employee experience / complaint / suggestion (voice, video, text, docs)."""
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=200)
    text = models.TextField(blank=True)
    voice_file = models.FileField(upload_to="rizviworld/feedback/voice/%Y/%m/", blank=True, null=True)
    video_file = models.FileField(upload_to="rizviworld/feedback/video/%Y/%m/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
