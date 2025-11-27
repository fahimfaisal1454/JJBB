from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Expense, SalaryExpense
from .serializers import ExpenseSerializer, SalaryExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("cost_category").order_by("-id")
    serializer_class = ExpenseSerializer
    permission_classes = [AllowAny]
    
class SalaryExpenseViewSet(viewsets.ModelViewSet):
    queryset = SalaryExpense.objects.select_related("staff").order_by("-id")
    serializer_class = SalaryExpenseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(staff__name__icontains=search)
                | Q(salary_month__icontains=search)
                | Q(note__icontains=search)
            )
        return qs