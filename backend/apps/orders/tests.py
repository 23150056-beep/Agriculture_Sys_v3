from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Category, Product
from apps.listings.models import Listing
from apps.locations.models import Location
from apps.orders.models import Order

User = get_user_model()


class OrdersApiTests(APITestCase):
    def setUp(self):
        self.distributor = User.objects.create_user(
            username="order_distributor",
            password="test12345",
            role="DISTRIBUTOR",
        )
        self.other_distributor = User.objects.create_user(
            username="other_distributor",
            password="test12345",
            role="DISTRIBUTOR",
        )
        self.manager = User.objects.create_user(
            username="order_manager",
            password="test12345",
            role="MANAGER",
        )

        category = Category.objects.create(name="Order Test Category")
        product = Product.objects.create(name="Order Test Product", category=category, default_unit="kg")
        location = Location.objects.create(
            province="P",
            city_municipality="C",
            barangay="B",
            postal_code="1000",
        )

        listing = Listing.objects.create(
            farmer=self.distributor,
            product=product,
            quantity_available=Decimal("80.00"),
            unit_price=Decimal("30.00"),
            unit="kg",
            quality_grade="A",
            harvest_date=timezone.localdate(),
            available_until=timezone.localdate() + timedelta(days=4),
            location=location,
            urgent_sale=False,
            status="ACTIVE",
        )

        self.order = Order.objects.create(
            buyer=self.manager,
            listing=listing,
            quantity=Decimal("4.00"),
            unit_price_snapshot=Decimal("30.00"),
            total_price=Decimal("120.00"),
            status="DRAFT",
            delivery_location=location,
            expected_delivery_date=timezone.localdate() + timedelta(days=2),
        )

    def test_manager_cannot_confirm_request(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_distributor_can_submit_own_request(self):
        self.client.force_authenticate(user=self.distributor)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "SUBMITTED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_distributor_cannot_update_other_distributor_request(self):
        self.client.force_authenticate(user=self.other_distributor)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "SUBMITTED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_order_status_transition_rejected(self):
        self.client.force_authenticate(user=self.distributor)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "DELIVERED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
