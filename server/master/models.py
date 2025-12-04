from django.db import models
from django.utils import timezone



class BusinessCategory(models.Model):
    name = models.CharField(max_length=100)


class CostCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class SourceCategory(models.Model):
    category_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.category_name


class PaymentMode(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class DivisionMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class DistrictMaster(models.Model):
    division = models.ForeignKey(DivisionMaster, on_delete=models.CASCADE, default=None)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class CountryMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class SupplierTypeMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class BankCategoryMaster(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class BankMaster(models.Model):
    name = models.CharField(max_length=100)
    bank_category = models.ForeignKey(BankCategoryMaster, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    


class AccountCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    

class BankAccount(models.Model):
    accountCategory = models.CharField(max_length=100)
    accountName = models.CharField(max_length=255)
    bankName = models.CharField(max_length=255)
    accountNo = models.CharField(max_length=50)
    bankAddress = models.TextField()
    bankContact = models.CharField(max_length=20)
    bankMail = models.EmailField()
    previousBalance = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return f"{self.bankName} - {self.accountName}"
    
    
    
#Bank Transaction Model

class BankTransaction(models.Model):
    """
    Stores all bank movements:
    - manual deposits/withdrawals
    - payments for purchases/sales/expenses (we'll link later)
    """

    TRANSACTION_TYPES = [
        ("DEPOSIT", "Deposit"),
        ("WITHDRAW", "Withdraw"),
        ("TRANSFER_IN", "Transfer In"),
        ("TRANSFER_OUT", "Transfer Out"),
        ("CHARGE", "Bank Charge"),
        ("INTEREST", "Bank Interest"),
    ]

    bank_account = models.ForeignKey(
        "BankAccount",
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    date = models.DateField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)

    # ALWAYS positive number, sign is decided from transaction_type
    amount = models.DecimalField(max_digits=15, decimal_places=2)

    narration = models.CharField(max_length=255, blank=True)
    reference_no = models.CharField(max_length=100, blank=True)

    # Optional: show running balance after this transaction
    running_balance = models.DecimalField(
        max_digits=15, decimal_places=2, blank=True, null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        return f"{self.bank_account.accountName} - {self.transaction_type} {self.amount}"

    def is_inflow(self):
        """Helper: inflow vs outflow"""
        return self.transaction_type in ["DEPOSIT", "TRANSFER_IN", "INTEREST"]