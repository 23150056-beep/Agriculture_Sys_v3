from django.urls import path

from .views import ActivityLogView, DispatcherOverviewView, FarmerOverviewView, SummaryView

urlpatterns = [
    path("summary/", SummaryView.as_view(), name="dashboard-summary"),
    path("farmer/overview/", FarmerOverviewView.as_view(), name="dashboard-farmer-overview"),
    path("dispatcher/overview/", DispatcherOverviewView.as_view(), name="dashboard-dispatcher-overview"),
    path("activity/", ActivityLogView.as_view(), name="dashboard-activity"),
]
