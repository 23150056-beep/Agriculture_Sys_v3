from rest_framework import filters, permissions, viewsets

from .models import Location
from .serializers import LocationSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by("province", "city_municipality", "barangay")
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["province", "city_municipality", "barangay"]
