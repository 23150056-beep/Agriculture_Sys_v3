from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ActivityLog
from .serializers import ActivityLogSerializer
from apps.demand_board.models import DemandPost
from apps.listings.models import Listing
from apps.logistics.models import Shipment, Trip
from apps.orders.models import Order


class SummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "users": {"role": request.user.role},
                "totals": {
                    "listings": Listing.objects.count(),
                    "orders": Order.objects.count(),
                    "shipments": Shipment.objects.count(),
                    "trips": Trip.objects.count(),
                    "demand_posts": DemandPost.objects.count(),
                },
            }
        )


class DistributorOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        listings = Listing.objects.filter(farmer=request.user).count()
        orders = Order.objects.filter(listing__farmer=request.user).count()
        return Response({"my_listings": listings, "orders_on_my_listings": orders})


class DispatcherOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        trips = Trip.objects.filter(dispatcher=request.user).count()
        pending_shipments = Shipment.objects.filter(status="PENDING_ASSIGNMENT").count()
        return Response({"my_trips": trips, "pending_assignment": pending_shipments})


class ManagerOverviewView(DispatcherOverviewView):
    pass


class FarmerOverviewView(DistributorOverviewView):
    pass


class ActivityLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        queryset = ActivityLog.objects.select_related("actor")
        if request.user.role == "ADMIN":
            return queryset
        return queryset.filter(actor=request.user)

    def get(self, request):
        logs = self.get_queryset(request)[:60]
        return Response(ActivityLogSerializer(logs, many=True).data)

    def post(self, request):
        serializer = ActivityLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = ActivityLog.objects.create(
            actor=request.user,
            role=request.user.role,
            module=serializer.validated_data.get("module", "ui"),
            action=serializer.validated_data.get("action", "event"),
            message=serializer.validated_data["message"],
            metadata=serializer.validated_data.get("metadata") or {},
        )
        return Response(ActivityLogSerializer(log).data, status=201)

    def delete(self, request):
        deleted, _ = self.get_queryset(request).delete()
        return Response({"deleted": deleted})
