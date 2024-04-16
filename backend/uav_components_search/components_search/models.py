from django.utils import timezone
from django.db import models


class Shop(models.Model):
    shop_name = models.CharField(max_length=100, null=False, blank=False)
    logo = models.CharField(max_length=200, null=False, blank=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    last_tested_at = models.DateTimeField(default=None, editable=True)
