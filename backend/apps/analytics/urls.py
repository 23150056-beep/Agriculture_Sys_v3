from django.urls import path

from .views import CommitmentVsActualView, WeeklyReportGenerateView, WeeklyReportLatestView


urlpatterns = [
    path("reports/weekly/generate", WeeklyReportGenerateView.as_view(), name="v4-weekly-report-generate"),
    path("reports/weekly/latest", WeeklyReportLatestView.as_view(), name="v4-weekly-report-latest"),
    path("analytics/commitment-vs-actual", CommitmentVsActualView.as_view(), name="v4-commitment-vs-actual"),
]
