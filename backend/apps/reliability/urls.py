from django.urls import path

from .views import DeliveryScoreDetailView, PodFlagListView, PodValidateView


urlpatterns = [
    path("delivery-score/<int:delivery_id>", DeliveryScoreDetailView.as_view(), name="v4-delivery-score"),
    path("pod-flags", PodFlagListView.as_view(), name="v4-pod-flags"),
    path("pod-validate/<int:proof_id>", PodValidateView.as_view(), name="v4-pod-validate"),
]
