from rest_framework import serializers

from .models import PriorityScore


class PriorityScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriorityScore
        fields = ["id", "request", "score_total", "factors_json", "calculated_at"]
