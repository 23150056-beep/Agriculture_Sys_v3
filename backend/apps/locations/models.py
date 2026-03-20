from django.db import models


class Location(models.Model):
    province = models.CharField(max_length=120)
    city_municipality = models.CharField(max_length=120)
    barangay = models.CharField(max_length=120)
    postal_code = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"{self.barangay}, {self.city_municipality}, {self.province}"
