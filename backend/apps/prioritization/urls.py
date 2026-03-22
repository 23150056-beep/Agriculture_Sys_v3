from django.urls import path

from .views import ManagerPriorityQueueView, RecalculatePriorityQueueView


urlpatterns = [
    path("priority-queue", ManagerPriorityQueueView.as_view(), name="v4-priority-queue"),
    path("priority-queue/recalculate", RecalculatePriorityQueueView.as_view(), name="v4-priority-queue-recalculate"),
]
