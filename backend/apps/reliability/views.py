from decimal import Decimal

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.logistics.models import DeliveryProof, Shipment
from apps.users.permissions import IsManager

from .models import DeliveryScore, PodIntegrityFlag
from .serializers import DeliveryScoreSerializer, PodIntegrityFlagSerializer


def _compute_delivery_score(delivery):
    on_time = Decimal("100.00") if delivery.status == Shipment.Status.DELIVERED else Decimal("50.00")
    proof = Decimal("30.00")
    completion = Decimal("100.00") if delivery.status == Shipment.Status.DELIVERED else Decimal("40.00")
    if hasattr(delivery, "pod"):
        pod = delivery.pod
        proof = Decimal("100.00") if pod.receiver_name and pod.note else Decimal("70.00")
    total = (on_time * Decimal("0.40")) + (proof * Decimal("0.30")) + (completion * Decimal("0.30"))
    return on_time, proof, completion, total


class DeliveryScoreDetailView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, delivery_id):
        shipment = Shipment.objects.filter(pk=delivery_id).first()
        if not shipment:
            return Response({"detail": "Delivery not found."}, status=404)

        on_time, proof, completion, total = _compute_delivery_score(shipment)
        score, _ = DeliveryScore.objects.update_or_create(
            delivery=shipment,
            defaults={
                "on_time_score": on_time,
                "proof_score": proof,
                "completion_score": completion,
                "total_score": total,
            },
        )
        return Response(DeliveryScoreSerializer(score).data)


class PodFlagListView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        flags = PodIntegrityFlag.objects.select_related("delivery_proof").all()[:200]
        return Response(PodIntegrityFlagSerializer(flags, many=True).data)


class PodValidateView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, proof_id):
        pod = DeliveryProof.objects.filter(pk=proof_id).select_related("shipment", "shipment__order").first()
        if not pod:
            return Response({"detail": "Proof not found."}, status=404)

        created_flags = []

        def create_flag(flag_type, severity, reason):
            exists = PodIntegrityFlag.objects.filter(delivery_proof=pod, flag_type=flag_type, reason=reason).exists()
            if not exists:
                created_flags.append(
                    PodIntegrityFlag.objects.create(
                        delivery_proof=pod,
                        flag_type=flag_type,
                        severity=severity,
                        reason=reason,
                    )
                )

        if not pod.receiver_name:
            create_flag("MISSING_RECEIVER", "HIGH", "Receiver name is missing.")
        if not pod.note:
            create_flag("MISSING_NOTE", "LOW", "Delivery note is missing.")
        if not pod.photo:
            create_flag("MISSING_PHOTO", "HIGH", "Proof image is missing.")
        if pod.delivered_at and pod.shipment.order.created_at and pod.delivered_at < pod.shipment.order.created_at:
            create_flag("TIME_ANOMALY", "HIGH", "Proof timestamp is earlier than request creation.")

        duplicate_photo_exists = (
            DeliveryProof.objects.filter(photo=pod.photo)
            .exclude(pk=pod.pk)
            .exists()
            if pod.photo
            else False
        )
        if duplicate_photo_exists:
            create_flag("DUPLICATE_IMAGE", "MEDIUM", "The same proof image is used by another delivery.")

        return Response(
            {
                "proof_id": pod.id,
                "flags_created": PodIntegrityFlagSerializer(created_flags, many=True).data,
                "total_flags": PodIntegrityFlag.objects.filter(delivery_proof=pod).count(),
            }
        )
