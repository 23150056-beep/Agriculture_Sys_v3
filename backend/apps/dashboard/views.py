from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

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


class FarmerOverviewView(APIView):
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
