from django.db import models
from master.models import CostCategory
from authentication.models import Staffs

class Expense(models.Model):
    cost_category = models.ForeignKey(
        CostCategory,
        on_delete=models.PROTECT,
        related_name="expenses",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    expense_date = models.DateField()          # user-provided date
    recorded_by = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.cost_category} - {self.amount}"
    
    
class SalaryExpense(models.Model):
    staff = models.ForeignKey(
        Staffs,
        on_delete=models.PROTECT,
        related_name="salary_expenses",
    )
    # '2025-01' etc. – simple and easy to filter
    salary_month = models.CharField(max_length=7)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.staff} - {self.salary_month} - {self.amount}"
