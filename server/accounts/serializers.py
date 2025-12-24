from rest_framework import serializers
from .models import Account, JournalEntry, JournalEntryLine




class AccountSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.name", read_only=True)
    class Meta:
        model = Account
        fields = "__all__"




class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source="account"
    )
    account_name = serializers.CharField(source="account.name", read_only=True)
    account_code = serializers.CharField(source="account.code", read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = [
            "id",
            "account_id",
            "account_name",
            "account_code",
            "debit",
            "credit",
            "description",
        ]




class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True)
    total_debit = serializers.SerializerMethodField()
    total_credit = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = [
            "id",
            "date",
            "reference",
            "description",
            "lines",
            "total_debit",
            "total_credit",
        ]

    def get_total_debit(self, obj):
        return obj.total_debit()

    def get_total_credit(self, obj):
        return obj.total_credit()

    def validate(self, data):
        debit = sum(line.get("debit", 0) for line in data["lines"])
        credit = sum(line.get("credit", 0) for line in data["lines"])

        if debit != credit:
            raise serializers.ValidationError(
                "Total Debit must equal Total Credit"
            )
        return data

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        journal = JournalEntry.objects.create(**validated_data)

        for line in lines_data:
            JournalEntryLine.objects.create(
                journal_entry=journal, **line
            )

        return journal
