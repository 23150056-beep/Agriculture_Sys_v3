from django.conf import settings
from django.db import models

from apps.demand_board.models import DemandPost


class WeeklyReport(models.Model):
    week_start = models.DateField()
    week_end = models.DateField()
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    summary_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "weekly_reports"


class CommitmentActualSnapshot(models.Model):
    demand_post = models.ForeignKey(DemandPost, on_delete=models.CASCADE, related_name="commitment_snapshots")
    distributor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commitment_snapshots")
    committed_qty = models.DecimalField(max_digits=12, decimal_places=2)
    actual_delivered_qty = models.DecimalField(max_digits=12, decimal_places=2)
    variance_qty = models.DecimalField(max_digits=12, decimal_places=2)
    snapshot_date = models.DateField()

    class Meta:
        ordering = ["-snapshot_date"]
        db_table = "commitment_actual_snapshots"
