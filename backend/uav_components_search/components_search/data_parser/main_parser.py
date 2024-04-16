from .get_json_data import find_json_files_list, parse_json
from .tag_parsers import get_parsed_object, parse_tag, parse_tag_element
from .get_soup import get_soup_playwright, get_soup_requests
from .collect_data import put_into_csv


# "shop name" : {
#   search_url,
#   base_url,
#   headers,
#   name_obj : { attribute_name, attrs: {} }
#   price_obj : { attribute_name, attrs: {} }
#   picture_obj : { attribute_name, attrs: {} }
#   url_obj : { attribute_name, attrs: {} }
# }


def get_page_url(search_url, query, query_separator):
    REPLACE_WITH_QUERY = "REPLACE_WITH_QUERY"
    query = query.replace(' ', query_separator)
    search_url = search_url.replace(REPLACE_WITH_QUERY, query)

    return search_url


def scrape_objects(soup, objects_pass_data):
    name = objects_pass_data["attribute_name"]
    attrs = objects_pass_data["attrs"]

    objects_list = soup.find_all(
        name=name,
        attrs=attrs
    )

    return objects_list


def get_product_data(product_objects, shop_name, name_obj, price_obj, picture_obj, url_obj):
    names, prices, pictures, urls = [], [], [], []

    for product_obj in product_objects:
        name_object = product_obj.find(
            name=name_obj["attribute_name"],
            attrs=name_obj["attrs"]
        )

        price_object = product_obj.find(
            name=price_obj["attribute_name"],
            attrs=price_obj["attrs"]
        )

        picture_object = product_obj.find(
            name=picture_obj["attribute_name"],
            attrs=picture_obj["attrs"]
        )

        url_object = product_obj.find(
            name=url_obj["attribute_name"],
            attrs=url_obj["attrs"]
        )

        required_objects = [name_object, price_object, picture_object, url_object]
        if not all(required_objects):
            # print(f"Name = {name_object}\tPrice = {price_object}\tPicture = {picture_object}\tURL = {url_object}")
            continue

        name = get_parsed_object(
            tag_object=name_object,
            path_to_data=name_obj["path_to_data"],
            data_source=name_obj["data_source"]
        )

        price = get_parsed_object(
            tag_object=price_object,
            path_to_data=price_obj["path_to_data"],
            data_source=price_obj["data_source"]
        )

        picture = get_parsed_object(
            tag_object=picture_object,
            path_to_data=picture_obj["path_to_data"],
            data_source=picture_obj["data_source"]
        )

        picture_part_to_add = picture_obj.get("add_to_url")
        if picture_part_to_add:
            picture = f"{picture_part_to_add}{picture}"

        url = get_parsed_object(
            tag_object=url_object,
            path_to_data=url_obj["path_to_data"],
            data_source=url_obj["data_source"]
        )

        url_part_to_add = url_obj.get("add_to_url")
        if url_part_to_add:
            url = f"{url_part_to_add}{url}"

        required_fields = [name, price, picture, url]
        if all(required_fields):
            names.append(name)
            prices.append(price)
            pictures.append(picture)
            urls.append(url)

    # print("----------------------------------")
    # print(f'Names ({len(names)}):\n {names}')
    # print(f'Prices ({len(prices)}):\n', prices, end="\n")
    # print(f'Pictures ({len(pictures)}):\n', pictures, end="\n")
    # print(f'Urls ({len(urls)}):\n', urls, end="\n")
    # print("----------------------------------")

    shop_component_list = []
    for name, price, img, url in zip(names, prices, pictures, urls):
        shop_component_list.append([name, price, img, url])

    all_products[shop_name] = shop_component_list

    put_into_csv(shop_name, names, prices, pictures, urls)


def get_next_page_from_button(soup, next_page_obj):
    name = next_page_obj["attribute_name"]
    attrs = next_page_obj["attrs"]

    next_page_object = soup.find(
        name=name,
        attrs=attrs
    )

    if not next_page_object:
        return

    path_to_data = next_page_obj["path_to_data"],
    data_source = next_page_obj["data_source"]
    add_to_url = next_page_obj["add_to_url"]

    next_page_object = parse_tag(tag_object=next_page_object, path_to_data=path_to_data)
    # print("obj = ", next_page_object)
    next_page = parse_tag_element(tag_object=next_page_object, data_source=data_source)
    # print("next_page = ", next_page)

    if add_to_url:
        return add_to_url + next_page

    return next_page


def get_next_page_add_to_url(url, add_to_url):
    ...


all_products = {}


def main_parser(query):
    all_products.clear()
    json_files_list = find_json_files_list()

    print("JSON files list = ", json_files_list)

    for source in json_files_list:
        source_data = parse_json(source_file_path=source)

        source_name = source_data["shop_file_name"]

        main_url = source_data["search_url"]
        base_url = source_data["base_url"]
        headers = source_data.get("headers")
        query_separator = source_data["query_separator"]
        selector_to_wait = source_data.get("selector_to_wait")
        scroll_down = source_data.get("scroll_down")

        shop_name = source_data["shop_name"]
        gallery_obj = source_data["gallery_obj"]
        product_obj = source_data["product_obj"]

        # Product selectors
        names = source_data.get("name_obj")
        prices = source_data.get("price_obj")
        pictures = source_data.get("picture_obj")
        urls = source_data.get("url_obj")

        pagination_type = source_data.get("pagination_type")

        url = get_page_url(
            search_url=main_url,
            query=query,
            query_separator=query_separator
        )

        print(source_name)

        page_counter = 1

        while True:
            if headers:
                soup = get_soup_requests(url, headers)
            else:
                soup = get_soup_playwright(url, selector_to_wait, scroll_down)

            gallery_soup = soup.find(name=gallery_obj["attribute_name"], attrs=gallery_obj["attrs"])

            # Перевірка наявності хоча б одного товару за пошуком
            if not gallery_soup:
                print("За пошуком товарів не знайдено")
                break

            product_objects = scrape_objects(
                soup=gallery_soup, objects_pass_data=product_obj
            )

            if len(product_objects) == 0:
                print("За пошуком товарів не знайдено")
                break

            # Отримати товари з поточної сторінки
            get_product_data(
                product_objects=product_objects,
                shop_name=shop_name,
                name_obj=names,
                price_obj=prices,
                picture_obj=pictures,
                url_obj=urls
            )

            # Отримати посилання на наступну сторінку
            url = None
            page_counter += 1
            if page_counter > 5:
                print('Забагато сторінок')
                break

            if pagination_type == 'next_page':
                next_page_obj = source_data['next_page']
                url = get_next_page_from_button(
                    soup=soup,
                    next_page_obj=next_page_obj
                )
            elif pagination_type == 'added_part':
                next_page_obj = source_data["added_part"]["add_pagination_to_url"]
                url = get_page_url(
                    search_url=main_url,
                    query=query,
                    query_separator=query_separator
                )
                url = f"{url}{next_page_obj}{page_counter}"

            if not url:
                print("Нову сторінку не знайдено")
                break

    return all_products
