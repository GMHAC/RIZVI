from rest_framework import serializers
from .models import (
    Department, Section, Designation, DailyEntry, EntryDocument,
    Announcement, Feedback, EmployeeAssignment,
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "order"]


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["id", "name", "order", "department"]


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ["id", "name", "order", "section"]


class EntryDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryDocument
        fields = ["id", "file", "original_name", "uploaded_at"]


class DailyEntrySerializer(serializers.ModelSerializer):
    documents = EntryDocumentSerializer(many=True, read_only=True)
    percent = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = DailyEntry
        fields = [
            "id", "designation", "submitted_by", "date", "task", "target",
            "achieved", "note", "voice_file", "video_file", "documents",
            "percent", "status", "created_at",
        ]
        read_only_fields = ["submitted_by", "created_at"]


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["id", "text", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            "id", "submitted_by", "title", "text", "voice_file",
            "video_file", "created_at", "resolved",
        ]
        read_only_fields = ["submitted_by", "created_at"]


class EmployeeAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAssignment
        fields = ["id", "user", "designation", "employee_id"]
