from decimal import Decimal

from django.db.models import Avg
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.users.permissions import IsDistributor, IsManager

from .models import GuidedAction, ReorderAlert, RequestRecommendation
from .serializers import GuidedActionSerializer, ReorderAlertSerializer, RequestRecommendationSerializer


class RequestQuantityRecommendationView(APIView):
    permission_classes = [IsAuthenticated, IsDistributor]

    def get(self, request):
        product_id = request.query_params.get("product_id")
        if not product_id:
            return Response({"detail": "product_id is required."}, status=400)

        historical_avg = (
            Order.objects.filter(buyer=request.user, listing__product_id=product_id)
            .aggregate(avg_qty=Avg("quantity"))
            .get("avg_qty")
        )
        suggested_qty = historical_avg or Decimal("100.00")
        confidence = Decimal("0.65") if historical_avg else Decimal("0.45")
        reason = {
            "historical_avg_used": bool(historical_avg),
            "role": request.user.role,
            "note": "Prototype assistant recommendation",
        }

        recommendation = RequestRecommendation.objects.create(
            distributor=request.user,
            product_id=product_id,
            suggested_qty=suggested_qty,
            confidence=confidence,
            reason_json=reason,
        )

        return Response(RequestRecommendationSerializer(recommendation).data)


class ReorderAlertListView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        alerts = ReorderAlert.objects.all()[:200]
        return Response(ReorderAlertSerializer(alerts, many=True).data)


class GuidedActionsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        actions = GuidedAction.objects.filter(user=request.user).order_by("is_done", "-priority", "-created_at")[:200]
        return Response(GuidedActionSerializer(actions, many=True).data)
