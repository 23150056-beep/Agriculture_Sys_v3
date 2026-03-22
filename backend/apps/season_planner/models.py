from django.conf import settings
from django.db import models

from apps.catalog.models import Product


class SeasonPlan(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"

    distributor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="season_plans")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="season_plans")
    season_name = models.CharField(max_length=120)
    start_date = models.DateField()
    target_harvest_date = models.DateField()
    area_size = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    class Meta:
        ordering = ["-start_date"]
        db_table = "season_plans"


class SeasonMilestone(models.Model):
    season_plan = models.ForeignKey(SeasonPlan, on_delete=models.CASCADE, related_name="season_milestones")
    milestone_type = models.CharField(max_length=60)
    due_date = models.DateField()
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["due_date"]
        db_table = "season_milestones"
