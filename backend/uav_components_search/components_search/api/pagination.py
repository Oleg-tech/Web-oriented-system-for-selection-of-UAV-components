from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ComponentsResultPagination(PageNumberPagination):
    page_size = 32
    max_page_size = 100
    shops = None

    def get_paginated_response(self, data):
        return Response({
            'detail': 'Query processed successfully',
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'search_result': data,
            'shop_list': self.shops or []
        })

    def paginate_queryset(self, queryset, request, view=None, shops=None):
        self.shops = shops
        return super().paginate_queryset(queryset, request, view)
