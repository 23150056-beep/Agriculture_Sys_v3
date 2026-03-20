from django.conf import settings
from django.db import models

from apps.orders.models import Order


class Vehicle(models.Model):
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=60)
    capacity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)


class Driver(models.Model):
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    license_no = models.CharField(max_length=60)
    is_active = models.BooleanField(default=True)


class Trip(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        LOADED = "LOADED", "Loaded"
        IN_TRANSIT = "IN_TRANSIT", "In Transit"
        DELIVERED = "DELIVERED", "Delivered"

    dispatcher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT)
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)


class Shipment(models.Model):
    class Status(models.TextChoices):
        PENDING_ASSIGNMENT = "PENDING_ASSIGNMENT", "Pending Assignment"
        SCHEDULED = "SCHEDULED", "Scheduled"
        LOADED = "LOADED", "Loaded"
        IN_TRANSIT = "IN_TRANSIT", "In Transit"
        DELIVERED = "DELIVERED", "Delivered"
        DELAYED = "DELAYED", "Delayed"
        FAILED = "FAILED", "Failed"

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="shipment")
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name="shipments")
    eta = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING_ASSIGNMENT)
    delay_reason = models.CharField(max_length=255, blank=True)


class DeliveryProof(models.Model):
    shipment = models.OneToOneField(Shipment, on_delete=models.CASCADE, related_name="pod")
    photo = models.ImageField(upload_to="pod/")
    receiver_name = models.CharField(max_length=120)
    note = models.CharField(max_length=255, blank=True)
    delivered_at = models.DateTimeField()
