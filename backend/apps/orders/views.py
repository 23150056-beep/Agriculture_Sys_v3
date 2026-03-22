from rest_framework import decorators, permissions, response, status, viewsets

from apps.dashboard.services import log_activity
from apps.users.permissions import IsDistributor

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
            return [permissions.IsAuthenticated(), IsDistributor()]
        return [permissions.IsAuthenticated()]

    def _set_status(self, order, next_status, changed_by, note="", metadata=None):
        previous_status = order.status
        order.status = next_status
        order.save(update_fields=["status", "updated_at"])
        OrderStatusLog.objects.create(
            order=order,
            from_status=previous_status,
            to_status=next_status,
            changed_by=changed_by,
            note=note,
            metadata_json=metadata or {},
        )
        log_activity(
            actor=changed_by,
            module="orders",
            action="update_status",
            message=f"Updated request #{order.id} from {previous_status} to {next_status}",
            metadata={"order_id": order.id, "from_status": previous_status, "to_status": next_status},
        )

    def perform_create(self, serializer):
        order = serializer.save(buyer=self.request.user)
        OrderStatusLog.objects.create(
            order=order,
            from_status="",
            to_status=order.status,
            changed_by=self.request.user,
            note="Request created",
        )
        log_activity(
            actor=self.request.user,
            module="orders",
            action="create_request",
            message=f"Created request #{order.id}",
            metadata={"order_id": order.id, "status": order.status},
        )

    @decorators.action(detail=False, methods=["get"], url_path="my")
    def my_requests_legacy(self, request):
        queryset = self.get_queryset().filter(buyer=request.user)
        return response.Response(self.get_serializer(queryset, many=True).data)

    @decorators.action(detail=False, methods=["get"], url_path="distributor/mine")
    def my_distributor_requests(self, request):
        if request.user.role not in ["DISTRIBUTOR", "ADMIN"]:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        queryset = self.get_queryset().filter(listing__farmer=request.user)
        return response.Response(self.get_serializer(queryset, many=True).data)

    @decorators.action(detail=False, methods=["get"], url_path="manager/queue")
    def manager_queue(self, request):
        if request.user.role not in ["MANAGER", "ADMIN"]:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        queryset = self.get_queryset().filter(status__in=["SUBMITTED", "UNDER_REVIEW"])
        return response.Response(self.get_serializer(queryset, many=True).data)

    @decorators.action(detail=False, methods=["get"], url_path="manager/approval-queue")
    def approval_queue(self, request):
        return self.manager_queue(request)

    @decorators.action(detail=True, methods=["post"], url_path="manager/approve")
    def approve(self, request, pk=None):
        order = self.get_object()
        if request.user.role not in ["MANAGER", "ADMIN"]:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if order.status == "SUBMITTED":
            self._set_status(order, "UNDER_REVIEW", request.user, "Auto-entered review before approval")
            order.refresh_from_db()
        if not is_valid_transition(order.status, "APPROVED"):
            return response.Response({"detail": "invalid status transition"}, status=status.HTTP_400_BAD_REQUEST)
        self._set_status(order, "APPROVED", request.user, request.data.get("note", "Approved by manager"))
        return response.Response(self.get_serializer(order).data)

    @decorators.action(detail=True, methods=["post"], url_path="manager/reject")
    def reject(self, request, pk=None):
        order = self.get_object()
        if request.user.role not in ["MANAGER", "ADMIN"]:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if order.status == "SUBMITTED":
            self._set_status(order, "UNDER_REVIEW", request.user, "Auto-entered review before rejection")
            order.refresh_from_db()
        if not is_valid_transition(order.status, "REJECTED"):
            return response.Response({"detail": "invalid status transition"}, status=status.HTTP_400_BAD_REQUEST)
        self._set_status(order, "REJECTED", request.user, request.data.get("note", "Rejected by manager"))
        return response.Response(self.get_serializer(order).data)

    @decorators.action(detail=True, methods=["post"], url_path="confirm")
    def confirm(self, request, pk=None):
        order = self.get_object()
        if request.user.role not in ["DISTRIBUTOR", "ADMIN"]:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == "DISTRIBUTOR" and order.listing.farmer_id != request.user.id:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if not is_valid_transition(order.status, "CONFIRMED"):
            return response.Response({"detail": "invalid status transition"}, status=status.HTTP_400_BAD_REQUEST)
        self._set_status(order, "CONFIRMED", request.user, request.data.get("note", "Delivery confirmed"))
        return response.Response(self.get_serializer(order).data)

    @decorators.action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        order = self.get_object()
        next_status = request.data.get("status")
        note = request.data.get("note", "")

        if request.user.role == "DISTRIBUTOR" and order.listing.farmer_id != request.user.id:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        distributor_allowed = {"SUBMITTED", "CONFIRMED"}
        manager_allowed = {"UNDER_REVIEW", "APPROVED", "REJECTED", "IN_DELIVERY", "DELIVERED"}
        if request.user.role == "DISTRIBUTOR" and next_status not in distributor_allowed:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == "MANAGER" and next_status not in manager_allowed:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role not in ["ADMIN", "MANAGER", "DISTRIBUTOR"]:
            return response.Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if not next_status:
            return response.Response({"detail": "status is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not is_valid_transition(order.status, next_status):
            return response.Response({"detail": "invalid status transition"}, status=status.HTTP_400_BAD_REQUEST)

        self._set_status(order, next_status, request.user, note)
        return response.Response(self.get_serializer(order).data)

    @decorators.action(detail=True, methods=["get"], url_path="timeline")
    def timeline(self, request, pk=None):
        order = self.get_object()
        logs = order.timeline.select_related("changed_by").all().order_by("changed_at")
        return response.Response(OrderStatusLogSerializer(logs, many=True).data)
