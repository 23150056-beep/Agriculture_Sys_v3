from django.db import models

from apps.orders.models import Order


class PriorityScore(models.Model):
    request = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="priority_scores")
    score_total = models.DecimalField(max_digits=6, decimal_places=2)
    factors_json = models.JSONField(default=dict, blank=True)
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-calculated_at"]
        db_table = "priority_scores"
