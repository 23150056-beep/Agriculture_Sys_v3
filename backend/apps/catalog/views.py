from rest_framework import permissions, viewsets

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all().order_by("name")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
