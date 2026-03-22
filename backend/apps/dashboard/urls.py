from django.urls import path

from .views import ActivityLogView, ManagerOverviewView, DistributorOverviewView, SummaryView, DispatcherOverviewView, FarmerOverviewView

urlpatterns = [
    path("summary/", SummaryView.as_view(), name="dashboard-summary"),
    path("manager/overview/", ManagerOverviewView.as_view(), name="dashboard-manager-overview"),
    path("distributor/overview/", DistributorOverviewView.as_view(), name="dashboard-distributor-overview"),
    path("farmer/overview/", FarmerOverviewView.as_view(), name="dashboard-farmer-overview"),
    path("dispatcher/overview/", DispatcherOverviewView.as_view(), name="dashboard-dispatcher-overview"),
    path("activity/", ActivityLogView.as_view(), name="dashboard-activity"),
]
