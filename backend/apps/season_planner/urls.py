from django.urls import path

from .views import SeasonMilestoneCreateView, SeasonPlanDetailView, SeasonPlanListCreateView


urlpatterns = [
    path("", SeasonPlanListCreateView.as_view(), name="v4-season-plan-list-create"),
    path("<int:pk>", SeasonPlanDetailView.as_view(), name="v4-season-plan-detail"),
    path("<int:pk>/milestones", SeasonMilestoneCreateView.as_view(), name="v4-season-plan-milestones"),
]
