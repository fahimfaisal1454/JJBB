# server/purchase/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, SalaryExpenseViewSet

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r"salary-expenses", SalaryExpenseViewSet, basename="salary-expenses")
urlpatterns = [
    path('', include(router.urls)),
]
