from rest_framework import serializers

from .models import CommitmentActualSnapshot, WeeklyReport


class WeeklyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyReport
        fields = ["id", "week_start", "week_end", "generated_by", "summary_json", "created_at"]


class CommitmentActualSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommitmentActualSnapshot
        fields = [
            "id",
            "demand_post",
            "distributor",
            "committed_qty",
            "actual_delivered_qty",
            "variance_qty",
            "snapshot_date",
        ]
