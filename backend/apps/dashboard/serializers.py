from rest_framework import serializers

from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "actor",
            "actor_username",
            "role",
            "module",
            "action",
            "message",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "actor", "actor_username", "created_at"]
