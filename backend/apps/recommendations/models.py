from django.conf import settings
from django.db import models

from apps.catalog.models import Product
from apps.locations.models import Location


class RequestRecommendation(models.Model):
    distributor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="request_recommendations")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="request_recommendations")
    suggested_qty = models.DecimalField(max_digits=12, decimal_places=2)
    confidence = models.DecimalField(max_digits=4, decimal_places=2)
    reason_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "request_recommendations"


class ReorderAlert(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        ACKNOWLEDGED = "ACKNOWLEDGED", "Acknowledged"
        CLOSED = "CLOSED", "Closed"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reorder_alerts")
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="reorder_alerts")
    risk_level = models.CharField(max_length=20, default="MEDIUM")
    projected_stockout_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "reorder_alerts"


class GuidedAction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="guided_actions")
    role = models.CharField(max_length=20)
    action_type = models.CharField(max_length=60)
    title = models.CharField(max_length=120)
    payload_json = models.JSONField(default=dict, blank=True)
    priority = models.PositiveSmallIntegerField(default=50)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["is_done", "-priority", "-created_at"]
        db_table = "guided_actions"
