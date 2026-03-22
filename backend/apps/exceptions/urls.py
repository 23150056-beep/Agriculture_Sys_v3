from django.urls import path

from .views import ExceptionAssignView, ExceptionListView, ExceptionResolveView


urlpatterns = [
    path("", ExceptionListView.as_view(), name="v4-exception-list"),
    path("<int:pk>/resolve", ExceptionResolveView.as_view(), name="v4-exception-resolve"),
    path("<int:pk>/assign", ExceptionAssignView.as_view(), name="v4-exception-assign"),
]
