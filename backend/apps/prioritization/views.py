from decimal import Decimal

from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.users.permissions import IsManager

from .models import PriorityScore
from .serializers import PriorityScoreSerializer


def _calculate_priority(order):
    days_waiting = max((timezone.now() - order.created_at).days, 0)
    waiting_component = min(days_waiting * 5, 25)

    if order.expected_delivery_date:
        days_to_due = (order.expected_delivery_date - timezone.localdate()).days
    else:
        days_to_due = 7
    urgency_component = 30 if days_to_due <= 1 else 20 if days_to_due <= 3 else 10

    stock_risk_component = 25 if order.quantity >= Decimal("500") else 15
    reliability_component = 20
    total = urgency_component + waiting_component + stock_risk_component + reliability_component
    factors = {
        "urgency": urgency_component,
        "waiting_time": waiting_component,
        "stock_risk": stock_risk_component,
        "distributor_reliability": reliability_component,
    }
    return Decimal(total), factors


class ManagerPriorityQueueView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        queue = Order.objects.filter(status__in=[Order.Status.SUBMITTED, Order.Status.UNDER_REVIEW]).order_by("created_at")
        payload = []
        for item in queue:
            latest = item.priority_scores.first()
            if latest:
                score_total = latest.score_total
                factors = latest.factors_json
            else:
                score_total, factors = _calculate_priority(item)

            payload.append(
                {
                    "request_id": item.id,
                    "status": item.status,
                    "created_at": item.created_at,
                    "score_total": score_total,
                    "factors_json": factors,
                }
            )

        payload.sort(key=lambda row: row["score_total"], reverse=True)
        return Response(payload)


class RecalculatePriorityQueueView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        queue = Order.objects.filter(status__in=[Order.Status.SUBMITTED, Order.Status.UNDER_REVIEW])
        created = 0
        updated = 0
        rows = []
        for item in queue:
            score_total, factors = _calculate_priority(item)
            score, was_created = PriorityScore.objects.update_or_create(
                request=item,
                defaults={"score_total": score_total, "factors_json": factors},
            )
            created += int(was_created)
            updated += int(not was_created)
            rows.append(score)

        return Response(
            {
                "created": created,
                "updated": updated,
                "scores": PriorityScoreSerializer(rows, many=True).data,
            }
        )
