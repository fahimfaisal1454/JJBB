# server/purchase/signals.py
from decimal import Decimal

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PurchaseProduct
from stocks.models import StockProduct


@receiver(post_save, sender=PurchaseProduct)
def update_stock_product(sender, instance, created, **kwargs):
    """
    When a new PurchaseProduct is created, update or create the matching
    StockProduct row.

    - Keeps your existing quantity / value logic
    - ALSO updates manufacture_date and expiry_date on the stock row
    """
    # Only react on creation; editing later is more complex
    if not created:
        return

    product = instance.product
    business_category = product.business_category

    qty = int(instance.purchase_quantity)
    price = Decimal(instance.purchase_price)

    # NEW: grab dates from the purchase line
    mfg_date = instance.manufacture_date
    exp_date = instance.expiry_date

    stock, created_stock = StockProduct.objects.get_or_create(
        product=product,
        business_category=business_category,
        defaults={
            "purchase_quantity": qty,
            "sale_quantity": 0,
            "damage_quantity": 0,
            "current_stock_quantity": qty,
            "purchase_price": price,
            # for now: sale price = last purchase price (you can change later)
            "sale_price": price,
            "current_stock_value": price * qty,
            # 🔹 set dates on first creation
            "manufacture_date": mfg_date,
            "expiry_date": exp_date,
        },
    )

    if not created_stock:
        # existing stock row -> update quantities and prices
        stock.purchase_quantity += qty
        stock.current_stock_quantity += qty
        stock.purchase_price = price
        stock.current_stock_value += price * qty

        # 🔹 update dates as well (simple strategy: overwrite with latest batch)
        if mfg_date:
            stock.manufacture_date = mfg_date
        if exp_date:
            stock.expiry_date = exp_date

        stock.save()
