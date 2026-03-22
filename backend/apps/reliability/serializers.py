from rest_framework import serializers

from .models import DeliveryScore, PodIntegrityFlag


class DeliveryScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryScore
        fields = [
            "id",
            "delivery",
            "on_time_score",
            "proof_score",
            "completion_score",
            "total_score",
            "calculated_at",
        ]


class PodIntegrityFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = PodIntegrityFlag
        fields = ["id", "delivery_proof", "flag_type", "severity", "reason", "created_at"]
