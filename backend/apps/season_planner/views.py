from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsDistributor

from .models import SeasonMilestone, SeasonPlan
from .serializers import SeasonMilestoneSerializer, SeasonPlanSerializer


class SeasonPlanListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsDistributor]

    def get(self, request):
        queryset = SeasonPlan.objects.filter(distributor=request.user).order_by("-start_date")
        return Response(SeasonPlanSerializer(queryset, many=True).data)

    def post(self, request):
        payload = request.data.copy()
        payload["distributor"] = request.user.id
        serializer = SeasonPlanSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class SeasonPlanDetailView(APIView):
    permission_classes = [IsAuthenticated, IsDistributor]

    def get(self, request, pk):
        instance = SeasonPlan.objects.filter(pk=pk, distributor=request.user).first()
        if not instance:
            return Response({"detail": "Season plan not found."}, status=404)
        return Response(SeasonPlanSerializer(instance).data)


class SeasonMilestoneCreateView(APIView):
    permission_classes = [IsAuthenticated, IsDistributor]

    def post(self, request, pk):
        plan = SeasonPlan.objects.filter(pk=pk, distributor=request.user).first()
        if not plan:
            return Response({"detail": "Season plan not found."}, status=404)

        payload = request.data.copy()
        payload["season_plan"] = plan.id
        serializer = SeasonMilestoneSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)
