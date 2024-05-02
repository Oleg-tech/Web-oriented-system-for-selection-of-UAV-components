from django.contrib import admin

from .models import Shop, Currency, Component


class ShopAdmin(admin.ModelAdmin):
    list_display = [
        'shop_name', 'logo', 'created_at', 'last_tested_at'
    ]
    list_display_links = ['shop_name']


class CurrencyAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'currency_acronym', 'currency_name', 'current_rate', 'last_updated_at'
    ]
    list_display_links = ['currency_acronym']


class ComponentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'component_name', 'component_company', 'component_type', 'component_parameters'
    ]
    list_display_links = ['component_name']


admin.site.register(Shop, ShopAdmin)
admin.site.register(Currency, CurrencyAdmin)
admin.site.register(Component, ComponentAdmin)
