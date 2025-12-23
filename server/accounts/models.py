from django.db import models
from decimal import Decimal
from django.core.exceptions import ValidationError




class Account(models.Model):
    ACCOUNT_TYPES = (
        ("ASSET", "Asset"),
        ("LIABILITY", "Liability"),
        ("EQUITY", "Equity"),
        ("INCOME", "Income"),
        ("EXPENSE", "Expense"),
    )

    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name}"




class JournalEntry(models.Model):
    date = models.DateField()
    reference = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_debit(self):
        return sum(line.debit for line in self.lines.all())

    def total_credit(self):
        return sum(line.credit for line in self.lines.all())

    def clean(self):
        if self.total_debit() != self.total_credit():
            raise ValidationError("Total Debit must equal Total Credit")

    def __str__(self):
        return f"Journal {self.id} - {self.date}"
    



class JournalEntryLine(models.Model):
    journal_entry = models.ForeignKey(
        JournalEntry, on_delete=models.CASCADE, related_name="lines"
    )
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    debit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    description = models.TextField(blank=True, null=True)

    def clean(self):
        if self.debit > 0 and self.credit > 0:
            raise ValidationError("A line cannot have both debit and credit")
        if self.debit < 0 or self.credit < 0:
            raise ValidationError("Debit or credit cannot be negative")

    def __str__(self):
        return f"{self.account.name}"
