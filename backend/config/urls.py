from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog.views import CategoryViewSet, ProductViewSet
from apps.demand_board.views import DemandOfferViewSet, DemandPostViewSet
from apps.listings.views import ListingViewSet
from apps.locations.views import LocationViewSet
from apps.logistics.views import ShipmentViewSet, TripViewSet, VehicleViewSet, DriverViewSet
from apps.orders.views import OrderViewSet
from apps.users.views import UserViewSet

router = DefaultRouter()
router.register(r"locations", LocationViewSet, basename="location")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"listings", ListingViewSet, basename="listing")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"requests", OrderViewSet, basename="request")
router.register(r"vehicles", VehicleViewSet, basename="vehicle")
router.register(r"drivers", DriverViewSet, basename="driver")
router.register(r"trips", TripViewSet, basename="trip")
router.register(r"shipments", ShipmentViewSet, basename="shipment")
router.register(r"deliveries", ShipmentViewSet, basename="delivery")
router.register(r"demand-posts", DemandPostViewSet, basename="demand-post")
router.register(r"demand-offers", DemandOfferViewSet, basename="demand-offer")

router_v4 = DefaultRouter()
router_v4.register(r"locations", LocationViewSet, basename="v4-location")
router_v4.register(r"products", ProductViewSet, basename="v4-product")
router_v4.register(r"listings", ListingViewSet, basename="v4-listing")
router_v4.register(r"requests", OrderViewSet, basename="v4-request")
router_v4.register(r"deliveries", ShipmentViewSet, basename="v4-delivery")
router_v4.register(r"shipments", ShipmentViewSet, basename="v4-shipment")
router_v4.register(r"trips", TripViewSet, basename="v4-trip")
router_v4.register(r"vehicles", VehicleViewSet, basename="v4-vehicle")
router_v4.register(r"drivers", DriverViewSet, basename="v4-driver")
router_v4.register(r"demand-posts", DemandPostViewSet, basename="v4-demand-post")
router_v4.register(r"demand-offers", DemandOfferViewSet, basename="v4-demand-offer")
router_v4.register(r"users", UserViewSet, basename="v4-user")

manager_approval_queue = OrderViewSet.as_view({"get": "approval_queue"})
manager_approve = OrderViewSet.as_view({"post": "approve"})
manager_reject = OrderViewSet.as_view({"post": "reject"})
request_confirm = OrderViewSet.as_view({"post": "confirm"})
delivery_assign = ShipmentViewSet.as_view({"post": "assign_v4"})
delivery_status = ShipmentViewSet.as_view({"patch": "update_status"})
delivery_proof = ShipmentViewSet.as_view({"post": "proof_v4"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/", include(router.urls)),
    path("api/v4/auth/", include("apps.users.urls")),
    path("api/v4/dashboard/", include("apps.dashboard.urls")),
    path("api/v4/manager/approval-queue/", manager_approval_queue, name="v4-manager-approval-queue"),
    path("api/v4/manager/requests/<int:pk>/approve/", manager_approve, name="v4-manager-approve"),
    path("api/v4/manager/requests/<int:pk>/reject/", manager_reject, name="v4-manager-reject"),
    path("api/v4/requests/<int:pk>/confirm/", request_confirm, name="v4-request-confirm"),
    path("api/v4/deliveries/assign/", delivery_assign, name="v4-delivery-assign"),
    path("api/v4/deliveries/<int:pk>/status/", delivery_status, name="v4-delivery-status"),
    path("api/v4/deliveries/<int:pk>/proof/", delivery_proof, name="v4-delivery-proof"),
    path("api/v4/recommendations/", include("apps.recommendations.urls")),
    path("api/v4/manager/", include("apps.prioritization.urls")),
    path("api/v4/reliability/", include("apps.reliability.urls")),
    path("api/v4/exceptions/", include("apps.exceptions.urls")),
    path("api/v4/season-plans/", include("apps.season_planner.urls")),
    path("api/v4/", include("apps.analytics.urls")),
    path("api/v4/", include(router_v4.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
