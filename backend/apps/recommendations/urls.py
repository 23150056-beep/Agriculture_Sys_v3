from django.urls import path

from .views import GuidedActionsListView, ReorderAlertListView, RequestQuantityRecommendationView


urlpatterns = [
    path("request-quantity", RequestQuantityRecommendationView.as_view(), name="v4-request-quantity-recommendation"),
    path("reorder-alerts", ReorderAlertListView.as_view(), name="v4-reorder-alerts"),
    path("guided-actions", GuidedActionsListView.as_view(), name="v4-guided-actions"),
]
