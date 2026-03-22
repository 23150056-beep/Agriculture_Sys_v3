from rest_framework import decorators, permissions, response, status, viewsets

from apps.dashboard.services import log_activity
from apps.users.permissions import IsManager

from .models import DeliveryProof, Driver, Shipment, Trip, Vehicle
from .serializers import (
    DeliveryProofSerializer,
    DriverSerializer,
    ShipmentSerializer,
    TripSerializer,
    VehicleSerializer,
)
from .services import can_assign_shipment_to_trip, capacity_ok, is_valid_shipment_transition


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by("plate_number")
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by("name")
    serializer_class = DriverSerializer
    permission_classes = [permissions.IsAuthenticated]


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.select_related("vehicle", "driver", "dispatcher").all().order_by("-scheduled_date")
    serializer_class = TripSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsManager()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(dispatcher=self.request.user)


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.select_related("order", "trip").all().order_by("id")
    serializer_class = ShipmentSerializer

    def get_permissions(self):
        if self.action in ["assign", "capacity_check", "consolidate", "update_status", "proof_of_delivery"]:
            return [permissions.IsAuthenticated(), IsManager()]
        return [permissions.IsAuthenticated()]

    @decorators.action(detail=False, methods=["get"], url_path="pending-assignment")
    def pending_assignment(self, request):
        queryset = self.get_queryset().filter(status="PENDING_ASSIGNMENT")
        return response.Response(self.get_serializer(queryset, many=True).data)

    @decorators.action(detail=False, methods=["post"], url_path="assign-shipment")
    def assign(self, request):
        shipment_id = request.data.get("shipment_id")
        trip_id = request.data.get("trip_id")
        shipment = Shipment.objects.select_related("order").filter(id=shipment_id).first()
        trip = Trip.objects.select_related("vehicle").filter(id=trip_id).first()
        if not shipment:
            return response.Response({"detail": "shipment not found"}, status=status.HTTP_404_NOT_FOUND)
        if not trip:
            return response.Response({"detail": "trip not found"}, status=status.HTTP_404_NOT_FOUND)
        if shipment.status != "PENDING_ASSIGNMENT":
            return response.Response({"detail": "shipment must be pending assignment"}, status=status.HTTP_400_BAD_REQUEST)
        if trip.status not in ["SCHEDULED", "LOADED"]:
            return response.Response({"detail": "trip is not assignable"}, status=status.HTTP_400_BAD_REQUEST)
        if not can_assign_shipment_to_trip(trip, shipment):
            return response.Response({"detail": "trip capacity exceeded"}, status=status.HTTP_400_BAD_REQUEST)
        shipment.trip_id = trip_id
        shipment.status = "SCHEDULED"
        shipment.save(update_fields=["trip", "status"])
        log_activity(
            actor=request.user,
            module="logistics",
            action="assign_shipment",
            message=f"Assigned shipment #{shipment.id} to trip #{trip.id}",
            metadata={"shipment_id": shipment.id, "trip_id": trip.id},
        )
        return response.Response(self.get_serializer(shipment).data)

    @decorators.action(detail=False, methods=["post"], url_path="assign")
    def assign_v4(self, request):
        return self.assign(request)

    @decorators.action(detail=False, methods=["post"], url_path="capacity-check")
    def capacity_check(self, request):
        vehicle_id = request.data.get("vehicle_id")
        weights = request.data.get("weights", [])
        vehicle = Vehicle.objects.filter(id=vehicle_id).first()
        if not vehicle:
            return response.Response({"detail": "vehicle not found"}, status=status.HTTP_404_NOT_FOUND)
        return response.Response({"ok": capacity_ok(vehicle.capacity_kg, weights)})

    @decorators.action(detail=False, methods=["post"], url_path="consolidate")
    def consolidate(self, request):
        shipment_ids = request.data.get("shipment_ids", [])
        consolidated = Shipment.objects.filter(id__in=shipment_ids).values("id", "order_id")
        return response.Response({"consolidated": list(consolidated)})

    @decorators.action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        shipment = self.get_object()
        next_status = request.data.get("status")
        if not next_status:
            return response.Response({"detail": "status is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not is_valid_shipment_transition(shipment.status, next_status):
            return response.Response({"detail": "invalid status transition"}, status=status.HTTP_400_BAD_REQUEST)
        shipment.status = next_status
        if next_status == "IN_TRANSIT":
            shipment.order.status = "IN_DELIVERY"
            shipment.order.save(update_fields=["status", "updated_at"])
        if next_status == "DELIVERED":
            shipment.order.status = "DELIVERED"
            shipment.order.save(update_fields=["status", "updated_at"])
        shipment.save(update_fields=["status"])
        log_activity(
            actor=request.user,
            module="logistics",
            action="update_shipment_status",
            message=f"Updated shipment #{shipment.id} to {next_status}",
            metadata={"shipment_id": shipment.id, "status": next_status},
        )
        return response.Response(self.get_serializer(shipment).data)

    @decorators.action(detail=True, methods=["post"], url_path="proof-of-delivery")
    def proof_of_delivery(self, request, pk=None):
        shipment = self.get_object()
        if shipment.status not in ["IN_TRANSIT", "LOADED", "DELAYED"]:
            return response.Response(
                {"detail": "proof of delivery allowed only for active delivery shipments"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = DeliveryProofSerializer(data={**request.data, "shipment": shipment.id})
        serializer.is_valid(raise_exception=True)
        pod = serializer.save()
        shipment.status = "DELIVERED"
        shipment.save(update_fields=["status"])
        shipment.order.status = "DELIVERED"
        shipment.order.save(update_fields=["status", "updated_at"])
        log_activity(
            actor=request.user,
            module="logistics",
            action="proof_of_delivery",
            message=f"Uploaded proof of delivery for shipment #{shipment.id}",
            metadata={"shipment_id": shipment.id, "pod_id": pod.id},
        )
        return response.Response(DeliveryProofSerializer(pod).data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=["post"], url_path="proof")
    def proof_v4(self, request, pk=None):
        return self.proof_of_delivery(request, pk=pk)
