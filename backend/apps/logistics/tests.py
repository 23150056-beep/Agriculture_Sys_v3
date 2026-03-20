from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Category, Product
from apps.listings.models import Listing
from apps.locations.models import Location
from apps.logistics.models import Driver, Shipment, Trip, Vehicle
from apps.orders.models import Order

User = get_user_model()


class LogisticsApiTests(APITestCase):
    def setUp(self):
        self.dispatcher = User.objects.create_user(
            username="dispatcher_test",
            password="test12345",
            role="DISPATCHER",
        )
        self.farmer = User.objects.create_user(
            username="farmer_test",
            password="test12345",
            role="FARMER",
        )
        self.buyer = User.objects.create_user(
            username="buyer_test",
            password="test12345",
            role="BUYER",
        )

        category = Category.objects.create(name="Test Category")
        product = Product.objects.create(name="Test Product", category=category, default_unit="kg")
        self.location = Location.objects.create(
            province="A",
            city_municipality="B",
            barangay="C",
            postal_code="1000",
        )

        listing = Listing.objects.create(
            farmer=self.farmer,
            product=product,
            quantity_available=Decimal("100.00"),
            unit_price=Decimal("20.00"),
            unit="kg",
            quality_grade="A",
            harvest_date=timezone.localdate(),
            available_until=timezone.localdate() + timedelta(days=4),
            location=self.location,
            urgent_sale=False,
            status="ACTIVE",
        )

        self.order = Order.objects.create(
            buyer=self.buyer,
            listing=listing,
            quantity=Decimal("5.00"),
            unit_price_snapshot=Decimal("20.00"),
            total_price=Decimal("100.00"),
            status="ASSIGNED",
            delivery_location=self.location,
            expected_delivery_date=timezone.localdate() + timedelta(days=3),
        )

        self.shipment = Shipment.objects.create(
            order=self.order,
            status="PENDING_ASSIGNMENT",
        )

        self.active_vehicle = Vehicle.objects.create(
            plate_number="TST-111",
            vehicle_type="Truck",
            capacity_kg=Decimal("1000.00"),
            is_active=True,
        )
        self.active_driver = Driver.objects.create(
            name="Driver One",
            phone="09170000000",
            license_no="LIC-111",
            is_active=True,
        )

        self.client.force_authenticate(user=self.dispatcher)

    def test_trip_create_rejects_inactive_vehicle(self):
        inactive_vehicle = Vehicle.objects.create(
            plate_number="TST-999",
            vehicle_type="Truck",
            capacity_kg=Decimal("1000.00"),
            is_active=False,
        )

        payload = {
            "vehicle": inactive_vehicle.id,
            "driver": self.active_driver.id,
            "scheduled_date": str(timezone.localdate() + timedelta(days=1)),
            "status": "SCHEDULED",
        }

        response = self.client.post("/api/trips/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vehicle", response.data)

    def test_trip_create_rejects_inactive_driver(self):
        inactive_driver = Driver.objects.create(
            name="Driver Two",
            phone="09171111111",
            license_no="LIC-222",
            is_active=False,
        )

        payload = {
            "vehicle": self.active_vehicle.id,
            "driver": inactive_driver.id,
            "scheduled_date": str(timezone.localdate() + timedelta(days=1)),
            "status": "SCHEDULED",
        }

        response = self.client.post("/api/trips/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("driver", response.data)

    def test_shipment_invalid_status_transition_rejected(self):
        response = self.client.patch(
            f"/api/shipments/{self.shipment.id}/status/",
            {"status": "DELIVERED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_shipment_valid_status_transition_updates_order(self):
        self.shipment.status = "LOADED"
        self.shipment.save(update_fields=["status"])

        response = self.client.patch(
            f"/api/shipments/{self.shipment.id}/status/",
            {"status": "IN_TRANSIT"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "IN_TRANSIT")

    def test_assign_requires_pending_shipment(self):
        trip = Trip.objects.create(
            dispatcher=self.dispatcher,
            vehicle=self.active_vehicle,
            driver=self.active_driver,
            scheduled_date=timezone.localdate() + timedelta(days=1),
            status="SCHEDULED",
        )

        self.shipment.status = "SCHEDULED"
        self.shipment.save(update_fields=["status"])

        response = self.client.post(
            "/api/shipments/assign-shipment/",
            {"shipment_id": self.shipment.id, "trip_id": trip.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assign_rejects_when_trip_capacity_exceeded(self):
        small_vehicle = Vehicle.objects.create(
            plate_number="TST-222",
            vehicle_type="Mini Truck",
            capacity_kg=Decimal("4.00"),
            is_active=True,
        )
        trip = Trip.objects.create(
            dispatcher=self.dispatcher,
            vehicle=small_vehicle,
            driver=self.active_driver,
            scheduled_date=timezone.localdate() + timedelta(days=1),
            status="SCHEDULED",
        )

        response = self.client.post(
            "/api/shipments/assign-shipment/",
            {"shipment_id": self.shipment.id, "trip_id": trip.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("detail"), "trip capacity exceeded")

    def test_assign_succeeds_when_trip_capacity_allows(self):
        trip = Trip.objects.create(
            dispatcher=self.dispatcher,
            vehicle=self.active_vehicle,
            driver=self.active_driver,
            scheduled_date=timezone.localdate() + timedelta(days=1),
            status="SCHEDULED",
        )

        response = self.client.post(
            "/api/shipments/assign-shipment/",
            {"shipment_id": self.shipment.id, "trip_id": trip.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.shipment.refresh_from_db()
        self.assertEqual(self.shipment.trip_id, trip.id)
        self.assertEqual(self.shipment.status, "SCHEDULED")
