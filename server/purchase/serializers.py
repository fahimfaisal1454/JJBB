from rest_framework import serializers
from .models import *
from stocks.serializers import ProductSerializer
from people.serializers import VendorSerializer
from people.models import Vendor



class ExpenseSerializer(serializers.ModelSerializer):
    cost_category_name = serializers.CharField(source="cost_category.category_name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "cost_category", "cost_category_name", "amount", "note", "expense_date", "recorded_by"]


class SalaryExpenseSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.name", read_only=True)

    class Meta:
        model = SalaryExpense
        fields = [
            "id",
            "staff",
            "staff_name",
            "salary_month",
            "amount",
            "note",
            "created_at",
        ]

class PurchaseProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )

    class Meta:
        model = PurchaseProduct
        fields = [
            'id',
            'product',
            'product_id',
            'part_no',
            'purchase_quantity',
            'purchase_price',
            'total_price',
        ]


# ----------------------------
# Purchase Payment Serializer
# ----------------------------
class PurchasePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchasePayment
        fields = [
            'id',
            'payment_mode',
            'bank_name',
            'account_no',
            'cheque_no',
            'paid_amount',
        ]


# ----------------------------
# Supplier Purchase Serializer
# ----------------------------
class PurchaseSerializer(serializers.ModelSerializer):
    products = PurchaseProductSerializer(many=True)
    payments = PurchasePaymentSerializer(many=True)
    supplier = VendorSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(),
        source='supplier',
        write_only=True
    )
    total_returned_quantity = serializers.IntegerField(read_only=True)
    total_returned_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Purchase
        fields = [
            'id',
            'supplier',
            'supplier_id',
            'purchase_date',
            'invoice_no',
            'total_amount',
            'discount_amount',
            'total_payable_amount',
            'products',
            'payments',
            'created_at',
            'total_returned_quantity',
            'total_returned_value',
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        products_data = validated_data.pop('products')
        payments_data = validated_data.pop('payments')
        purchase = Purchase.objects.create(**validated_data)

        for product in products_data:
            PurchaseProduct.objects.create(purchase=purchase, **product)

        for payment in payments_data:
            PurchasePayment.objects.create(purchase=purchase, **payment)

        return purchase

    def update(self, instance, validated_data):
        instance.supplier = validated_data.get('supplier', instance.supplier)
        instance.purchase_date = validated_data.get('purchase_date', instance.purchase_date)
        instance.invoice_no = validated_data.get('invoice_no', instance.invoice_no)
        instance.total_amount = validated_data.get('total_amount', instance.total_amount)
        instance.discount_amount = validated_data.get('discount_amount', instance.discount_amount)
        instance.total_payable_amount = validated_data.get('total_payable_amount', instance.total_payable_amount)
        instance.save()
        return instance
