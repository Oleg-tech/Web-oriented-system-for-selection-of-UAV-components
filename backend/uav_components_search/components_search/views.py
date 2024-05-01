import os
import json
import asyncio
import concurrent.futures
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse

from .data_parser.get_json_data import find_json_files_list, parse_json
from .data_parser.main_parser import main_parser
from .data_parser.asyncio_main_parser import asyncio_main_parser
from .data_parser.remove_inappropriate import remove_inappropriate_components
from .utils import get_user_ip
from .services import get_redis_connection
from .api.pagination import ComponentsResultPagination
from .api.serializers import ComponentSerializer
from .api.filters import create_result_components_list, get_min_and_max
from .get_current_exchange_rate import main_exchange_rate


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


def fill_countries(components):
    ...


def extract_shops(components):
    list_of_shops = [component['componentShopName'] for component in components]
    return set(list_of_shops)


def extract_countries(components):
    list_of_countries = [component.get('componentCountry') for component in components]
    return set(list_of_countries)


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
        min_price_filter = all_filters.get('min_price')
        max_price_filter = all_filters.get('max_price')
        sorting = all_filters.get('sorting')

        print("Query = ", query)
        print("All filters = ", all_filters)
        print("Shop filters = ", shop_filters)
        print("Countries filters = ", countries_filters)
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

            shops = extract_shops(components)
            countries = extract_countries(components)

            components = create_result_components_list(
                components=components,
                shop_filters=shop_filters,
                countries_filters=countries_filters,
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

        # Зберегти результат запиту в Redis
        redis_client = get_redis_connection()
        redis_key = f"{query}"
        redis_value = json.dumps(components)
        redis_client.set(redis_key, redis_value, ex=60 * 30)

        min_price, max_price = get_min_and_max(components=components)
        print(min_price, max_price)

        shops = extract_shops(components=components)
        countries = extract_countries(components=components)

        components = create_result_components_list(
            components=components,
            shop_filters=shop_filters,
            countries_filters=countries_filters,
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
            min_price_filter=min_price_filter,
            max_price_filter=max_price_filter,
            sorting=sorting
        )

        print("Number of components 2 = ", len(components))

        serializer = ComponentSerializer(components, many=True)

        return Response(serializer.data)


def get_shops_data():
    shops_data = []
    json_files = find_json_files_list()

    for json_file in json_files:
        try:
            extracted_data = parse_json(json_file)
            shops_data.append(
                {
                    "name": extracted_data["shop_name"],
                    "base_url": extracted_data["base_url"],
                    "country": extracted_data["country"]
                }
            )
        except Exception as ex:
            print("Error with extracting data from json file:\n", ex)

    return shops_data


def extract_shop_json(shop_url):
    json_files = find_json_files_list()

    for json_file in json_files:
        extracted_data = parse_json(json_file)
        if extracted_data["base_url"] == shop_url:
            data = {
                "file_name": json_file.split('\\')[-1],
                "data": extracted_data
            }

            return data

    return None


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


class AdminComponentFileView(APIView):
    def get(self, request, *args, **kwargs):
        shops = get_shops_data()

        return Response({"shops": shops})

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
