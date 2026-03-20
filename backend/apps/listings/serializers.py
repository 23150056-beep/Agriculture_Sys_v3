from rest_framework import serializers

from .models import Listing, ListingImage
from .services import should_mark_urgent


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ["id", "image"]


class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    farmer_name = serializers.CharField(source="farmer.full_name", read_only=True)

    class Meta:
        model = Listing
        fields = "__all__"
        read_only_fields = ["farmer", "urgent_sale", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["urgent_sale"] = should_mark_urgent(validated_data.get("available_until"))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "available_until" in validated_data:
            validated_data["urgent_sale"] = should_mark_urgent(validated_data.get("available_until"))
        return super().update(instance, validated_data)
