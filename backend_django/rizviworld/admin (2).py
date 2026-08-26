from django.contrib import admin
from .models import (
    Department, Section, Designation, DailyEntry, EntryDocument,
    Announcement, Feedback, EmployeeAssignment, SyncStore,
)

admin.site.register(Department)
admin.site.register(Section)
admin.site.register(Designation)
admin.site.register(EmployeeAssignment)
admin.site.register(Announcement)


@admin.register(DailyEntry)
class DailyEntryAdmin(admin.ModelAdmin):
    list_display = ("designation", "date", "target", "achieved", "percent", "status", "submitted_by")
    list_filter = ("date", "designation__section__department")
    search_fields = ("designation__name", "task")


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("title", "submitted_by", "created_at", "resolved")
    list_filter = ("resolved",)


admin.site.register(EntryDocument)


@admin.register(SyncStore)
class SyncStoreAdmin(admin.ModelAdmin):
    list_display = ("key", "updated_at", "updated_by")
    search_fields = ("key",)
    readonly_fields = ("updated_at",)
