from django.db import models


class ExceptionCase(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        ASSIGNED = "ASSIGNED", "Assigned"
        RESOLVED = "RESOLVED", "Resolved"

    exception_type = models.CharField(max_length=40)
    entity_type = models.CharField(max_length=40)
    entity_id = models.PositiveIntegerField()
    severity = models.CharField(max_length=20, default="MEDIUM")
    owner_role = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "exceptions"
