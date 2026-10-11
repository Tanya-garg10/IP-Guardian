"""
IP Guardian - Django REST Framework Serializers Reference
"""

from rest_framework import serializers
from .models import IPRecord, Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id',
            'ip_record',
            'filename',
            'file_type',
            'file_size',
            'upload_date',
            'storage_reference',
            'description'
        ]
        read_only_fields = ['id', 'upload_date']


class IPRecordSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    days_until_deadline = serializers.SerializerMethodField()

    class Meta:
        model = IPRecord
        fields = [
            'id',
            'title',
            'ip_type',
            'description',
            'inventor_name',
            'owner_name',
            'application_number',
            'filing_date',
            'application_status',
            'next_deadline',
            'notes',
            'created_at',
            'updated_at',
            'created_by',
            'documents',
            'days_until_deadline'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def get_days_until_deadline(self, obj):
        if not obj.next_deadline:
            return None
        from datetime import date
        delta = obj.next_deadline - date.today()
        return delta.days
