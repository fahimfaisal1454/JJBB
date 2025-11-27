from rest_framework import serializers
from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    usable_qty = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Asset
        fields = [
            "id",
            "name",
            "code",
            "purchase_date",
            "total_qty",
            "damaged_qty",
            "usable_qty",
        ]
        # disable default unique validator on code so we can handle it manually
        extra_kwargs = {
            "code": {"validators": []},
        }

    def get_usable_qty(self, obj):
        return obj.usable_qty

    def validate(self, attrs):
        total = attrs.get("total_qty", 0)
        damaged = attrs.get("damaged_qty", 0)
        if damaged > total:
            raise serializers.ValidationError(
                {"damaged_qty": "Damaged quantity cannot be more than total quantity."}
            )
        return attrs

    def create(self, validated_data):
        """
        If an asset with the same code exists:
        - increase total_qty by incoming total_qty
        - increase damaged_qty by incoming damaged_qty
        else:
        - create new asset
        """
        code = validated_data.get("code")
        inc_total = validated_data.get("total_qty", 0)
        inc_damaged = validated_data.get("damaged_qty", 0)

        try:
          asset = Asset.objects.get(code=code)
          # merge quantities
          new_total = asset.total_qty + inc_total
          new_damaged = asset.damaged_qty + inc_damaged

          if new_damaged > new_total:
              raise serializers.ValidationError(
                  {"damaged_qty": "Total damaged (old + new) cannot be more than total quantity."}
              )

          asset.total_qty = new_total
          asset.damaged_qty = new_damaged

          # optional: keep latest name / date
          if "name" in validated_data:
              asset.name = validated_data["name"]
          if "purchase_date" in validated_data:
              asset.purchase_date = validated_data["purchase_date"]

          asset.save()
          return asset

        except Asset.DoesNotExist:
          # no existing → normal create
          return super().create(validated_data)
