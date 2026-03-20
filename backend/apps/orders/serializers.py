from decimal import Decimal

from rest_framework import serializers

from .models import Order, OrderStatusLog


class OrderStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.full_name", read_only=True)

    class Meta:
        model = OrderStatusLog
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    timeline = OrderStatusLogSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["buyer", "unit_price_snapshot", "total_price", "created_at", "updated_at"]

    def create(self, validated_data):
        listing = validated_data["listing"]
        quantity = validated_data["quantity"]
        validated_data["unit_price_snapshot"] = listing.unit_price
        validated_data["total_price"] = Decimal(quantity) * Decimal(listing.unit_price)
        return super().create(validated_data)
