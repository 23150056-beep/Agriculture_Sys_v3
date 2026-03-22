from django.db import models

from apps.logistics.models import DeliveryProof, Shipment


class DeliveryScore(models.Model):
    delivery = models.OneToOneField(Shipment, on_delete=models.CASCADE, related_name="delivery_score")
    on_time_score = models.DecimalField(max_digits=5, decimal_places=2)
    proof_score = models.DecimalField(max_digits=5, decimal_places=2)
    completion_score = models.DecimalField(max_digits=5, decimal_places=2)
    total_score = models.DecimalField(max_digits=5, decimal_places=2)
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-calculated_at"]
        db_table = "delivery_scores"


class PodIntegrityFlag(models.Model):
    delivery_proof = models.ForeignKey(DeliveryProof, on_delete=models.CASCADE, related_name="integrity_flags")
    flag_type = models.CharField(max_length=40)
    severity = models.CharField(max_length=20, default="MEDIUM")
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "pod_integrity_flags"
