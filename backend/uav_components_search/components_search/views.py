from django.shortcuts import render
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse

from .data_parser.main_parser import main_parser


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


class FindComponentView(APIView):
    def post(self, request, *args, **kwargs):
        query = request.data.get('query')
        print("Query = ", query)

        if not query:
            return Response({'detail': 'Введіть товар для пошуку'}, status=status.HTTP_400_BAD_REQUEST)

        components = main_parser(query=query)
        # print("Result = ", result)

        return Response({
            'detail': 'Query processed successfully',
            'search_result': components
        })
