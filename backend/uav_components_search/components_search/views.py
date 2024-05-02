import os
import json
import asyncio
import concurrent.futures
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .data_parser.get_json_data import find_json_files_list, parse_json
from .data_parser.asyncio_main_parser import asyncio_main_parser
from .data_parser.remove_inappropriate import remove_inappropriate_components
from .utils import (
    get_user_ip, extract_shops, extract_countries, get_shops_data,
    extract_shop_json, insert_parameters, extract_companies, extract_parameters
)
from .services import get_redis_connection
from .api.pagination import ComponentsResultPagination
from .api.serializers import ComponentSerializer
from .api.filters import create_result_components_list, get_min_and_max
from .get_current_exchange_rate import main_exchange_rate


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


def extract_parameter_filters(parameters):
    new_parameters = {}

    for key, value in parameters.items():
        if value:
            new_parameters[key] = value

    return new_parameters


def run_asyncio_main_parser(user_ip, query):
    loop = asyncio.new_event_loop()
    try:
        components = loop.run_until_complete(asyncio_main_parser(user_ip, query))
    finally:
        loop.close()
    return components


class FindComponentView(APIView):
    pagination_class = ComponentsResultPagination

    def post(self, request, *args, **kwargs):
        query = request.data.get('query')
        all_filters = self.request.query_params.dict()
        shop_filters = all_filters.get('shops')
        countries_filters = all_filters.get('countries')
        companies_filters = all_filters.get('companies')
        parameters_filters = extract_parameter_filters(parameters=request.data.get('parameters'))
        min_price_filter = all_filters.get('min_price')
        max_price_filter = all_filters.get('max_price')
        sorting = all_filters.get('sorting')

        print("Query = ", query)
        print("All filters = ", all_filters)
        print("Shop filters = ", shop_filters)
        print("Countries filters = ", countries_filters)
        print("Parameters filters = ", parameters_filters)
        print("Minimal price = ", min_price_filter)
        print("Maximal price = ", max_price_filter)
        print("Sorting = ", sorting)

        if not query:
            return Response({'detail': 'Введіть товар для пошуку'}, status=status.HTTP_400_BAD_REQUEST)

        paginator = self.pagination_class()

        user_ip = get_user_ip(request)
        redis_client = get_redis_connection()

        # Оновлення курсу валют
        main_exchange_rate()

        # Перевірка наявності такого запиту протягом останніх 20 хвилин
        query_recent_request = redis_client.get(query.strip())
        if query_recent_request:
            components = json.loads(query_recent_request)

            min_price, max_price = get_min_and_max(components=components)
            print(min_price, max_price)

            shops = extract_shops(components=components)
            countries = extract_countries(components=components)
            companies = extract_companies(components=components)
            parameters = extract_parameters(components=components)

            components = create_result_components_list(
                components=components,
                shop_filters=shop_filters,
                countries_filters=countries_filters,
                companies_filters=companies_filters,
                parameters_filters=parameters_filters,
                min_price_filter=min_price_filter,
                max_price_filter=max_price_filter,
                sorting=sorting
            )

            print("Shops = ", shops)
            print("Number of components = ", len(components))
            result_page = paginator.paginate_queryset(
                queryset=components,
                request=request,
                shops=shops,
                countries=countries,
                companies=companies,
                parameters=parameters,
                min_price=min_price,
                max_price=max_price
            )
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

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(run_asyncio_main_parser, user_ip, query)
            components = future.result()

        # Відсіяти зайві результати
        components = remove_inappropriate_components(
            query=query,
            components=components
        )

        # Додати додаткові параметри для фільтрів
        components = insert_parameters(
            components=components
        )

        # Зберегти результат запиту в Redis
        redis_client = get_redis_connection()
        redis_key = f"{query}"
        redis_value = json.dumps(components)
        redis_client.set(redis_key, redis_value, ex=60 * 30)

        min_price, max_price = get_min_and_max(components=components)
        print(min_price, max_price)

        shops = extract_shops(components=components)
        countries = extract_countries(components=components)
        companies = extract_companies(components=components)
        parameters = extract_parameters(components=components)

        components = create_result_components_list(
            components=components,
            shop_filters=shop_filters,
            countries_filters=countries_filters,
            companies_filters=companies_filters,
            parameters_filters=parameters_filters,
            min_price_filter=min_price_filter,
            max_price_filter=max_price_filter,
            sorting=sorting
        )

        # Пагінація
        print("Shops = ", shops)
        result_page = paginator.paginate_queryset(
            queryset=components,
            request=request,
            shops=shops,
            countries=countries,
            companies=companies,
            parameters=parameters,
            min_price=min_price,
            max_price=max_price
        )
        serializer = ComponentSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)


class DownloadComponentView(APIView):
    def post(self, request, *args, **kwargs):
        query = request.data.get('query')
        all_filters = self.request.query_params.dict()
        shop_filters = all_filters.get('shops')
        countries_filters = all_filters.get('countries')
        companies_filters = all_filters.get('companies')
        parameters_filters = request.data.get('parameters')
        min_price_filter = all_filters.get('min_price')
        max_price_filter = all_filters.get('max_price')
        sorting = all_filters.get('sorting')

        if not query:
            return Response({'detail': 'Введіть товар для пошуку'}, status=status.HTTP_400_BAD_REQUEST)

        redis_client = get_redis_connection()

        # Перевірка наявності такого запиту протягом останніх 20 хвилин
        query_recent_request = redis_client.get(query.strip())
        if not query_recent_request:
            return Response({'detail': 'Дані не знайдено'}, status=status.HTTP_400_BAD_REQUEST)

        components = json.loads(query_recent_request)

        components = create_result_components_list(
            components=components,
            shop_filters=shop_filters,
            countries_filters=countries_filters,
            companies_filters=companies_filters,
            parameters_filters=parameters_filters,
            min_price_filter=min_price_filter,
            max_price_filter=max_price_filter,
            sorting=sorting
        )

        print("Number of components 2 = ", len(components))

        serializer = ComponentSerializer(components, many=True)

        return Response(serializer.data)


def delete_shop(shop_url):
    json_files = find_json_files_list()

    try:
        for json_file in json_files:
            extracted_data = parse_json(json_file)
            if extracted_data["base_url"] == shop_url:
                os.remove(json_file)
                print("Файл успішно видалено")
    except FileNotFoundError:
        print("Файл не знайдено")
    except PermissionError:
        print("Немає дозволу на видалення файлу")
    except Exception as e:
        print("Помилка при видаленні файлу:", e)

    return Response({"detail": "Shop deleted successfully"})


def update_file(shop_url, new_file):
    json_files = find_json_files_list()

    try:
        for json_file in json_files:
            extracted_data = parse_json(json_file)
            if extracted_data["base_url"] == shop_url:
                # os.remove(json_file)
                print("URL = ", extracted_data["base_url"])
                print("Json file = ", json_file)
                print("new file = ", new_file)

                with open(json_file, 'wb') as f:
                    f.write(new_file.read())

                print("Файл успішно оновлено")
    except FileNotFoundError:
        print("Файл не знайдено")
    except PermissionError:
        print("Немає дозволу на видалення файлу")
    except Exception as e:
        print("Помилка при видаленні файлу:", e)

    return Response({"detail": "Shop updated successfully"})


class SuperUserLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None and user.is_superuser:
            refresh = TokenObtainPairSerializer.get_token(user)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response(data)
        else:
            return Response({'error': 'Invalid credentials or user is not a superuser'}, status=status.HTTP_401_UNAUTHORIZED)


class AdminComponentFileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.is_superuser:
            shops = get_shops_data()
            return Response({"shops": shops})
        return Response({"detail": "Permission denied"})

    def post(self, request, *args, **kwargs):
        operation = request.data.get('operation')
        shop_url = request.data.get('shop_url')

        print("Operation = ", operation)
        print("Shop URL = ", shop_url)

        if operation == "add":
            full_path = "./components_search/data_parser/component_source_data"

            new_file = request.data.get('file')
            new_file_name = f"{full_path}\\{request.data.get('filename')}"

            with open(new_file_name, 'wb') as f:
                f.write(new_file.read())
            print("File successfully saved:", new_file_name)

        if operation == "download":
            shop_data = extract_shop_json(
                shop_url=shop_url
            )
            return Response({"data": shop_data})

        if operation == "send":
            print("Filename = ", request.data.get('filename'))
            full_path = "./components_search/data_parser/component_source_data"

            new_file = request.data.get('file')
            new_file_name = f"{full_path}\\{request.data.get('filename')}"

            update_file(
                shop_url=shop_url,
                new_file=new_file
            )

        if operation == "delete":
            delete_shop(
                shop_url=shop_url
            )

        return Response({"shops": 1})
