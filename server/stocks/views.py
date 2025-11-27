# stocks/views.py
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Asset
from .serializers import AssetSerializer

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by("name")
    serializer_class = AssetSerializer
    permission_classes = [AllowAny]
