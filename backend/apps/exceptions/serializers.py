from rest_framework import serializers

from .models import ExceptionCase


class ExceptionCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExceptionCase
        fields = [
            "id",
            "exception_type",
            "entity_type",
            "entity_id",
            "severity",
            "owner_role",
            "status",
            "created_at",
            "resolved_at",
        ]
