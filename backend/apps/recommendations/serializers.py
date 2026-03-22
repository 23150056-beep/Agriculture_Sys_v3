from rest_framework import serializers

from .models import GuidedAction, ReorderAlert, RequestRecommendation


class RequestRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestRecommendation
        fields = [
            "id",
            "distributor",
            "product",
            "suggested_qty",
            "confidence",
            "reason_json",
            "created_at",
        ]


class ReorderAlertSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ReorderAlert
        fields = [
            "id",
            "product",
            "product_name",
            "location",
            "risk_level",
            "projected_stockout_date",
            "status",
            "created_at",
        ]


class GuidedActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuidedAction
        fields = [
            "id",
            "user",
            "role",
            "action_type",
            "title",
            "payload_json",
            "priority",
            "is_done",
            "created_at",
        ]
