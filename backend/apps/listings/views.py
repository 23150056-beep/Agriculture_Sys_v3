from rest_framework import decorators, permissions, response, status, viewsets

from apps.users.permissions import IsDistributor

from .models import Listing
from .serializers import ListingSerializer
from .services import should_mark_urgent


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.select_related("farmer", "product", "location").all().order_by("-created_at")
    serializer_class = ListingSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy", "mine", "mine_legacy", "clone"]:
            return [permissions.IsAuthenticated(), IsDistributor()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    @decorators.action(detail=False, methods=["get"], url_path="distributor/mine")
    def mine(self, request):
        queryset = self.get_queryset().filter(farmer=request.user)
        data = self.get_serializer(queryset, many=True).data
        return response.Response(data)

    @decorators.action(detail=False, methods=["get"], url_path="farmer/mine")
    def mine_legacy(self, request):
        return self.mine(request)

    @decorators.action(detail=True, methods=["post"], url_path="clone")
    def clone(self, request, pk=None):
        listing = self.get_object()
        listing.pk = None
        listing.status = "ACTIVE"
        listing.quantity_available = listing.quantity_available
        listing.urgent_sale = should_mark_urgent(listing.available_until)
        listing.save()
        return response.Response(self.get_serializer(listing).data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=["get"], url_path="sell-fast-suggestion")
    def sell_fast_suggestion(self, request, pk=None):
        listing = self.get_object()
        urgent = should_mark_urgent(listing.available_until)
        message = "Mark as urgent and consider slight discount." if urgent else "No urgent action needed."
        return response.Response({"urgent_sale": urgent, "message": message})
