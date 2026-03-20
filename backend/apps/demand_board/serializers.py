from rest_framework import serializers

from .models import DemandOffer, DemandPost


class DemandOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandOffer
        fields = "__all__"
        read_only_fields = ["farmer"]


class DemandPostSerializer(serializers.ModelSerializer):
    offers = DemandOfferSerializer(many=True, read_only=True)

    class Meta:
        model = DemandPost
        fields = "__all__"
        read_only_fields = ["buyer"]
