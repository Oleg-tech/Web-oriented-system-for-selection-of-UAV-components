from django.contrib import admin

from .models import Shop


class ShopAdmin(admin.ModelAdmin):
    list_display = [
        'shop_name', 'logo', 'created_at', 'last_tested_at'
    ]
    list_display_links = ['shop_name']


admin.site.register(Shop, ShopAdmin)
