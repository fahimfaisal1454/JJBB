from rest_framework import serializers
from .models import Expense, SalaryExpense

class ExpenseSerializer(serializers.ModelSerializer):
    cost_category_name = serializers.CharField(source="cost_category.category_name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "cost_category", "cost_category_name", "amount", "note", "expense_date", "recorded_by"]

class SalaryExpenseSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.name", read_only=True)

    class Meta:
        model = SalaryExpense
        fields = ["id","staff","staff_name","salary_month","amount","note","created_at"]