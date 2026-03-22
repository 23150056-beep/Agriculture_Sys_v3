from rest_framework import decorators, permissions, response, viewsets

from apps.dashboard.services import log_activity
from apps.users.permissions import IsDistributor, IsManager

from .models import DemandOffer, DemandPost
from .serializers import DemandOfferSerializer, DemandPostSerializer


class DemandPostViewSet(viewsets.ModelViewSet):
    queryset = DemandPost.objects.prefetch_related("offers").all().order_by("-id")
    serializer_class = DemandPostSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated(), IsManager()]
        if self.action in ["offers"]:
            return [permissions.IsAuthenticated(), IsDistributor()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        post = serializer.save(buyer=self.request.user)
        log_activity(
            actor=self.request.user,
            module="demand",
            action="create_post",
            message=f"Created demand post #{post.id}",
            metadata={"demand_post_id": post.id},
        )

    @decorators.action(detail=True, methods=["post"], url_path="offers")
    def offers(self, request, pk=None):
        self.get_object()
        serializer = DemandOfferSerializer(data={**request.data, "demand_post": pk})
        serializer.is_valid(raise_exception=True)
        offer = serializer.save(farmer=request.user)
        log_activity(
            actor=request.user,
            module="demand",
            action="create_offer",
            message=f"Submitted offer for demand post #{pk}",
            metadata={"offer_id": offer.id, "demand_post_id": int(pk)},
        )
        return response.Response(serializer.data)


class DemandOfferViewSet(viewsets.ModelViewSet):
    queryset = DemandOffer.objects.select_related("demand_post", "farmer").all().order_by("-id")
    serializer_class = DemandOfferSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated(), IsDistributor()]
        return [permissions.IsAuthenticated()]
