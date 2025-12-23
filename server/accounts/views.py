from rest_framework.viewsets import ModelViewSet
from .models import Account, JournalEntry
from .serializers import AccountSerializer, JournalEntrySerializer



class AccountViewSet(ModelViewSet):
    queryset = Account.objects.filter(is_active=True)
    serializer_class = AccountSerializer


class JournalEntryViewSet(ModelViewSet):
    queryset = JournalEntry.objects.all().order_by("-date")
    serializer_class = JournalEntrySerializer
