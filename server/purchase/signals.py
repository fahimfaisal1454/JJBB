# server/purchase/signals.py
from decimal import Decimal

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PurchaseProduct
from stocks.models import StockProduct


@receiver(post_save, sender=PurchaseProduct)
def update_stock_product(sender, instance, created, **kwargs):
    # Only react on creation; editing later is more complex
    if not created:
        return

    product = instance.product
    business_category = product.business_category

    qty = int(instance.purchase_quantity)
    price = Decimal(instance.purchase_price)

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
        },
    )

    if not created_stock:
        stock.purchase_quantity += qty
        stock.current_stock_quantity += qty
        stock.purchase_price = price
        stock.current_stock_value += price * qty
        stock.save()
