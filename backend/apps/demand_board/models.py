from django.conf import settings
from django.db import models

from apps.catalog.models import Product
from apps.locations.models import Location


class DemandPost(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="demand_posts")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    target_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    budget_min = models.DecimalField(max_digits=12, decimal_places=2)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2)
    required_by_date = models.DateField()
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)


class DemandOffer(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    demand_post = models.ForeignKey(DemandPost, on_delete=models.CASCADE, related_name="offers")
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="demand_offers")
    offered_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    offered_price = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
