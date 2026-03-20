from rest_framework import decorators, permissions, response, viewsets

from apps.users.permissions import IsBuyer, IsFarmer

from .models import DemandOffer, DemandPost
from .serializers import DemandOfferSerializer, DemandPostSerializer


class DemandPostViewSet(viewsets.ModelViewSet):
    queryset = DemandPost.objects.prefetch_related("offers").all().order_by("-id")
    serializer_class = DemandPostSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated(), IsBuyer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

    @decorators.action(detail=True, methods=["post"], url_path="offers")
    def offers(self, request, pk=None):
        self.get_object()
        serializer = DemandOfferSerializer(data={**request.data, "demand_post": pk})
        serializer.is_valid(raise_exception=True)
        serializer.save(farmer=request.user)
        return response.Response(serializer.data)


class DemandOfferViewSet(viewsets.ModelViewSet):
    queryset = DemandOffer.objects.select_related("demand_post", "farmer").all().order_by("-id")
    serializer_class = DemandOfferSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated(), IsFarmer()]
        return [permissions.IsAuthenticated()]
