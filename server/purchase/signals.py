from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import *
from decimal import Decimal
from stocks.model import StockProduct



@receiver(post_save, sender = PurchaseProduct)
def update_stock_product(sender, instance, created, **kwargs):

    if not created:
        return
    

    company_name = instance.purchase.company_name
    part_no = instance.part_no
    product = instance.product

    

    stock, created_stock = StockProduct.objects.get_or_create(
        product: product,
        defaults={
            'purchase_quantity': instance.purchase_quantity,
            'current_stock_quantity': instance.purchase_quantity,
            'purchase_price': instance.purchase_price,
            'sale_price': instance.purchase_price_with_percentage,
            'current_stock_value': instance.purchase_price * instance.purchase_quantity
        }
    )


    if not created_stock:
        pq = int(instance.purchase_quantity)
        pp = Decimal(instance.purchase_price)
        
        stock.purchase_quantity += pq
        stock.current_stock_quantity += pq
        stock.purchase_price = pp
        stock.current_stock_value += pp * pq
        stock.save()

