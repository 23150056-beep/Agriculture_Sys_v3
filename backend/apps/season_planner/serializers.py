from rest_framework import serializers

from .models import SeasonMilestone, SeasonPlan


class SeasonMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeasonMilestone
        fields = ["id", "season_plan", "milestone_type", "due_date", "completed_at"]


class SeasonPlanSerializer(serializers.ModelSerializer):
    season_milestones = SeasonMilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = SeasonPlan
        fields = [
            "id",
            "distributor",
            "product",
            "season_name",
            "start_date",
            "target_harvest_date",
            "area_size",
            "status",
            "season_milestones",
        ]
