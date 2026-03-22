from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsManager

from .models import ExceptionCase
from .serializers import ExceptionCaseSerializer


class ExceptionListView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        queryset = ExceptionCase.objects.all()[:200]
        return Response(ExceptionCaseSerializer(queryset, many=True).data)


class ExceptionResolveView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def patch(self, request, pk):
        instance = ExceptionCase.objects.filter(pk=pk).first()
        if not instance:
            return Response({"detail": "Exception not found."}, status=404)
        instance.status = ExceptionCase.Status.RESOLVED
        instance.resolved_at = timezone.now()
        instance.save(update_fields=["status", "resolved_at"])
        return Response(ExceptionCaseSerializer(instance).data)


class ExceptionAssignView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def patch(self, request, pk):
        instance = ExceptionCase.objects.filter(pk=pk).first()
        if not instance:
            return Response({"detail": "Exception not found."}, status=404)
        owner_role = request.data.get("owner_role", "MANAGER")
        instance.owner_role = owner_role
        instance.status = ExceptionCase.Status.ASSIGNED
        instance.save(update_fields=["owner_role", "status"])
        return Response(ExceptionCaseSerializer(instance).data)
