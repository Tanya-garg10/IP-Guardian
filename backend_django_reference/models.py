"""
IP Guardian - Django ORM Models Reference
Compatible with Python 3.12+, Django 5.x, SQLite & PostgreSQL
"""

from django.db import models
from django.contrib.auth.models import User
import uuid

class IPRecord(models.Model):
    class IPType(models.TextChoices):
        PATENT = 'Patent', 'Patent'
        TRADEMARK = 'Trademark', 'Trademark'
        COPYRIGHT = 'Copyright', 'Copyright'

    class ApplicationStatus(models.TextChoices):
        IDEA = 'Idea', 'Idea'
        DRAFT = 'Draft', 'Draft'
        FILED = 'Filed', 'Filed'
        UNDER_REVIEW = 'Under Review', 'Under Review'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'

    id = models.CharField(primary_key=True, max_length=64, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, db_index=True)
    ip_type = models.CharField(max_length=20, choices=IPType.choices, default=IPType.PATENT)
    description = models.TextField()
    inventor_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    application_number = models.CharField(max_length=100, db_index=True)
    filing_date = models.DateField()
    application_status = models.CharField(
        max_length=30,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.DRAFT,
        db_index=True
    )
    next_deadline = models.DateField(null=True, blank=True, db_index=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ip_records')

    class Meta:
        ordering = ['-filing_date', '-created_at']
        indexes = [
            models.Index(fields=['ip_type', 'application_status']),
            models.Index(fields=['next_deadline']),
        ]

    def __str__(self):
        return f"[{self.ip_type}] {self.title} ({self.application_number})"


def document_upload_path(instance, filename):
    return f"documents/{instance.ip_record.id}/{uuid.uuid4()}_{filename}"

class Document(models.Model):
    id = models.CharField(primary_key=True, max_length=64, default=uuid.uuid4, editable=False)
    ip_record = models.ForeignKey(IPRecord, on_delete=models.CASCADE, related_name='documents')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    upload_date = models.DateTimeField(auto_now_add=True)
    storage_reference = models.FileField(upload_to=document_upload_path)
    description = models.CharField(max_length=500, blank=True, default='')

    class Meta:
        ordering = ['-upload_date']

    def __str__(self):
        return f"{self.filename} ({self.ip_record.title})"
