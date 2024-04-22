import json
from django.shortcuts import render
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.http import HttpResponse

from .data_parser.main_parser import main_parser
from .utils import get_user_ip
from .services import get_redis_connection
from .api.pagination import ComponentsResultPagination


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


class ComponentSerializer(serializers.Serializer):
    componentName = serializers.CharField()
    componentPrice = serializers.CharField()
    componentImageURL = serializers.URLField()
    componentExternalURL = serializers.URLField()
    componentShopName = serializers.CharField()


class FindComponentView(APIView):
    pagination_class = ComponentsResultPagination

    def post(self, request, *args, **kwargs):
        query = request.data.get('query')
        print("Query = ", query)

        if not query:
            return Response({'detail': 'Введіть товар для пошуку'}, status=status.HTTP_400_BAD_REQUEST)

        paginator = self.pagination_class()

        user_ip = get_user_ip(request)
        redis_client = get_redis_connection()

        # Перевірка наявності такого запиту протягом останніх 10 хвилин
        query_recent_request = redis_client.get(query.strip())
        if query_recent_request:
            components = json.loads(query_recent_request)
            print("Number of components = ", len(components))
            result_page = paginator.paginate_queryset(components, request)
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

        # Пагінація
        result_page = paginator.paginate_queryset(components, request)
        serializer = ComponentSerializer(result_page, many=True)

        return paginator.get_paginated_response({
            'detail': 'Query processed successfully',
            'search_result': serializer.data
        })
