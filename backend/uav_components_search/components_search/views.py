import json
from django.shortcuts import render
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse

from .data_parser.main_parser import main_parser
from .utils import get_user_ip
from .services import get_redis_connection
from .api.pagination import ComponentsResultPagination
from .api.serializers import ComponentSerializer
from .api.filters import create_result_components_list


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


def extract_shops(components):
    list_of_shops = [component['componentShopName'] for component in components]
    return set(list_of_shops)


class FindComponentView(APIView):
    pagination_class = ComponentsResultPagination

    def post(self, request, *args, **kwargs):
        query = request.data.get('query')
        all_filters = self.request.query_params.dict()
        shop_filters = all_filters.get('shops')
        min_price_filter = all_filters.get('min_price')
        max_price_filter = all_filters.get('max_price')
        sorting = all_filters.get('sorting')

        print("Query = ", query)
        print("All filters = ", all_filters)
        print("Shop filters = ", shop_filters)
        print("Minimal price = ", min_price_filter)
        print("Maximal price = ", max_price_filter)
        print("Sorting = ", sorting)
        # print(type(shop_filters))

        if not query:
            return Response({'detail': 'Введіть товар для пошуку'}, status=status.HTTP_400_BAD_REQUEST)

        paginator = self.pagination_class()

        user_ip = get_user_ip(request)
        redis_client = get_redis_connection()

        # Перевірка наявності такого запиту протягом останніх 10 хвилин
        query_recent_request = redis_client.get(query.strip())
        if query_recent_request:
            components = json.loads(query_recent_request)

            shops = extract_shops(components)

            components = create_result_components_list(
                components=components,
                shop_filters=shop_filters,
                min_price_filter=min_price_filter,
                max_price_filter=max_price_filter,
                sorting=sorting
            )

            print("Shops = ", shops)
            print("Number of components = ", len(components))
            result_page = paginator.paginate_queryset(components, request, shops=shops)
            serializer = ComponentSerializer(result_page, many=True)

            return paginator.get_paginated_response(
                serializer.data
            )

        # Перевірка користувача на велику кількість запитів
        user_recent_request = redis_client.get(user_ip)
        if user_recent_request:
            return Response({
                'detail': 'Too many requests. Wait a minute.'
            })

        components = main_parser(user_ip=user_ip, query=query)

        shops = extract_shops(components=components)

        components = create_result_components_list(
            components=components,
            shop_filters=shop_filters,
            min_price_filter=min_price_filter,
            max_price_filter=max_price_filter,
            sorting=sorting
        )

        # Пагінація
        print("Shops = ", shops)
        result_page = paginator.paginate_queryset(components, request, shops=shops)
        serializer = ComponentSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)
