# server/purchase/apps.py
from django.apps import AppConfig

class PurchaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'purchase'

    def ready(self):
        # ensures signals.py is loaded
        import purchase.signals
