from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=120)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    default_unit = models.CharField(max_length=40, default="kg")

    def __str__(self):
        return self.name
