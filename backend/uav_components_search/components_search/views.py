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


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


class FindComponentView(APIView):
    def post(self, request, *args, **kwargs):
        query = request.data.get('query')
        print("Query = ", query)

        if not query:
            return Response({'detail': 'Введіть товар для пошуку'}, status=status.HTTP_400_BAD_REQUEST)

        user_ip = get_user_ip(request)
        redis_client = get_redis_connection()

        # Перевірка користувача на велику кількість запитів
        user_recent_request = redis_client.get(user_ip)
        if user_recent_request:
            return Response({
                'detail': 'Too many requests. Wait a minute.'
            })

        # Перевірка наявності такого запиту протягом останніх 10 хвилин
        query_recent_request = redis_client.get(query.strip())
        if query_recent_request:
            return Response({
                'detail': 'Query processed successfully',
                'search_result': json.loads(query_recent_request)
            })

        components = main_parser(user_ip=user_ip, query=query)

        return Response({
            'detail': 'Query processed successfully',
            'search_result': components
        })
