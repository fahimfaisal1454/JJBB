# stocks/models.py
from django.db import models
from django.utils import timezone

class Asset(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    purchase_date = models.DateField(default=timezone.now)
    total_qty = models.PositiveIntegerField(default=0)
    damaged_qty = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.code})"

    @property
    def usable_qty(self):
        return max(self.total_qty - self.damaged_qty, 0)