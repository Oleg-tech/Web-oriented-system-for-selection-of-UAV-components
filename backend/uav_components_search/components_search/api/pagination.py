from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ComponentsResultPagination(PageNumberPagination):
    page_size = 32
    max_page_size = 100
    shops = None
    countries = None
    min_price = None
    max_price = None

    def get_paginated_response(self, data):
        return Response({
            'detail': 'Query processed successfully',
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'search_result': data,
            'shop_list': self.shops or [],
            'countries_list': self.countries or [],
            'min_price': str(self.min_price) or None,
            'max_price': str(self.max_price) or None
        })

    def paginate_queryset(self, queryset, request, view=None, shops=None, countries=None, min_price=None, max_price=None):
        self.shops = shops
        self.countries = countries
        self.min_price = min_price
        self.max_price = max_price

        return super().paginate_queryset(queryset, request, view)
