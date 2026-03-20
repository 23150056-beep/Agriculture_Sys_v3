from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        FARMER = "FARMER", "Farmer"
        BUYER = "BUYER", "Buyer"
        DISPATCHER = "DISPATCHER", "Dispatcher"

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.BUYER)
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
