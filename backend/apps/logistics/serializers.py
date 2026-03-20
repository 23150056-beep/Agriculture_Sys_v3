from rest_framework import serializers

from .models import DeliveryProof, Driver, Shipment, Trip, Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = "__all__"


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"


class TripSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        vehicle = attrs.get("vehicle")
        driver = attrs.get("driver")

        if vehicle and not vehicle.is_active:
            raise serializers.ValidationError({"vehicle": "Selected vehicle is inactive"})
        if driver and not driver.is_active:
            raise serializers.ValidationError({"driver": "Selected driver is inactive"})

        return attrs

    class Meta:
        model = Trip
        fields = "__all__"


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = "__all__"


class DeliveryProofSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryProof
        fields = "__all__"
