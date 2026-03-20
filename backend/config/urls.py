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

router = DefaultRouter()
router.register(r"locations", LocationViewSet, basename="location")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"listings", ListingViewSet, basename="listing")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"vehicles", VehicleViewSet, basename="vehicle")
router.register(r"drivers", DriverViewSet, basename="driver")
router.register(r"trips", TripViewSet, basename="trip")
router.register(r"shipments", ShipmentViewSet, basename="shipment")
router.register(r"demand-posts", DemandPostViewSet, basename="demand-post")
router.register(r"demand-offers", DemandOfferViewSet, basename="demand-offer")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
