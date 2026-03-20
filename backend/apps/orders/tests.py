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
        self.farmer = User.objects.create_user(
            username="order_farmer",
            password="test12345",
            role="FARMER",
        )
        self.other_farmer = User.objects.create_user(
            username="other_farmer",
            password="test12345",
            role="FARMER",
        )
        self.buyer = User.objects.create_user(
            username="order_buyer",
            password="test12345",
            role="BUYER",
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
            farmer=self.farmer,
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
            buyer=self.buyer,
            listing=listing,
            quantity=Decimal("4.00"),
            unit_price_snapshot=Decimal("30.00"),
            total_price=Decimal("120.00"),
            status="PENDING",
            delivery_location=location,
            expected_delivery_date=timezone.localdate() + timedelta(days=2),
        )

    def test_buyer_cannot_update_order_status(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_farmer_can_update_own_order_status(self):
        self.client.force_authenticate(user=self.farmer)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_farmer_cannot_update_other_farmer_order(self):
        self.client.force_authenticate(user=self.other_farmer)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_order_status_transition_rejected(self):
        self.client.force_authenticate(user=self.farmer)
        response = self.client.patch(
            f"/api/orders/{self.order.id}/status/",
            {"status": "DELIVERED"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
