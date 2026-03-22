from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.users.permissions import IsAdmin

from .models import CommitmentActualSnapshot, WeeklyReport
from .serializers import CommitmentActualSnapshotSerializer, WeeklyReportSerializer


class WeeklyReportGenerateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        summary = {
            "requests_created": Order.objects.filter(created_at__date__range=(week_start, week_end)).count(),
            "requests_by_status": {
                row["status"]: row["count"]
                for row in Order.objects.filter(created_at__date__range=(week_start, week_end))
                .values("status")
                .annotate(count=Count("id"))
            },
            "generated_for": f"{week_start} to {week_end}",
        }
        report = WeeklyReport.objects.create(
            week_start=week_start,
            week_end=week_end,
            generated_by=request.user,
            summary_json=summary,
        )
        return Response(WeeklyReportSerializer(report).data, status=201)


class WeeklyReportLatestView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        latest = WeeklyReport.objects.order_by("-created_at").first()
        if not latest:
            return Response({"detail": "No weekly report found."}, status=404)
        return Response(WeeklyReportSerializer(latest).data)


class CommitmentVsActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CommitmentActualSnapshot.objects.all()
        if request.user.role == "DISTRIBUTOR":
            queryset = queryset.filter(distributor=request.user)
        queryset = queryset.order_by("-snapshot_date")[:300]
        return Response(CommitmentActualSnapshotSerializer(queryset, many=True).data)
