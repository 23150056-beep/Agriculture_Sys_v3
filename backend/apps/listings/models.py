from django.conf import settings
from django.db import models

from apps.catalog.models import Product
from apps.locations.models import Location


class Listing(models.Model):
    class QualityGrade(models.TextChoices):
        A = "A", "A"
        B = "B", "B"
        C = "C", "C"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"
        SOLD_OUT = "SOLD_OUT", "Sold Out"

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="listings")
    quantity_available = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=40)
    quality_grade = models.CharField(max_length=1, choices=QualityGrade.choices)
    harvest_date = models.DateField(null=True, blank=True)
    available_until = models.DateField()
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name="listings")
    urgent_sale = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="listings/")
