from rest_framework import decorators, permissions, response, status, viewsets

from apps.dashboard.services import log_activity
from apps.users.permissions import IsBuyer

from .models import Order, OrderStatusLog
from .serializers import OrderSerializer, OrderStatusLogSerializer
from .services import is_valid_transition


class OrderViewSet(viewsets.ModelViewSet):
    queryset = (
        Order.objects.select_related("buyer", "listing", "listing__product", "delivery_location")
        .prefetch_related("timeline", "listing__images")
        .all()
        .order_by("-created_at")
    )
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated(), IsBuyer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        order = serializer.save(buyer=self.request.user)
        OrderStatusLog.objects.create(order=order, from_status="", to_status=order.status, changed_by=self.request.user, note="Order created")
        log_activity(
            actor=self.request.user,
            module="orders",
            action="create_order",
            message=f"Created order #{order.id}",
            metadata={"order_id": order.id, "status": order.status},
        )

    @decorators.action(detail=False, methods=["get"], url_path="my")
    def my_orders(self, request):
        queryset = self.get_queryset().filter(buyer=request.user)
        return response.Response(self.get_serializer(queryset, many=True).data)

    @decorators.action(detail=False, methods=["get"], url_path="farmer/mine")
    def my_farmer_orders(self, request):
        if request.user.role not in ["FARMER", "ADMIN"]:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        queryset = self.get_queryset().filter(listing__farmer=request.user)
        return response.Response(self.get_serializer(queryset, many=True).data)

    @decorators.action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        order = self.get_object()
        next_status = request.data.get("status")
        note = request.data.get("note", "")

        # Farmers can only update orders for their own listings.
        if request.user.role == "FARMER" and order.listing.farmer_id != request.user.id:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == "BUYER":
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if not next_status:
            return response.Response({"detail": "status is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not is_valid_transition(order.status, next_status):
            return response.Response({"detail": "invalid status transition"}, status=status.HTTP_400_BAD_REQUEST)

        previous_status = order.status
        order.status = next_status
        order.save(update_fields=["status", "updated_at"])
        OrderStatusLog.objects.create(order=order, from_status=previous_status, to_status=next_status, changed_by=request.user, note=note)
        log_activity(
            actor=request.user,
            module="orders",
            action="update_status",
            message=f"Updated order #{order.id} from {previous_status} to {next_status}",
            metadata={"order_id": order.id, "from_status": previous_status, "to_status": next_status},
        )
        return response.Response(self.get_serializer(order).data)

    @decorators.action(detail=True, methods=["get"], url_path="timeline")
    def timeline(self, request, pk=None):
        order = self.get_object()
        logs = order.timeline.select_related("changed_by").all().order_by("changed_at")
        return response.Response(OrderStatusLogSerializer(logs, many=True).data)
