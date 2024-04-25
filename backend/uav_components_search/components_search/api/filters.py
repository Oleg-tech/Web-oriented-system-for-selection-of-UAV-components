def filter_by_shop_name(components, shop_names):
    shop_names = [name.lower() for name in shop_names.split(',')]

    filtered_components = [
        component for component in components if component['componentShopName'].lower() in shop_names
    ]

    return filtered_components


def filter_by_price(components, min_price, max_price):
    filtered_components = []
    for component in components:
        if type(component) == float and max_price >= component['componentPrice'] >= min_price:
            filtered_components.append(component)
        elif type(component) == list and component['componentPrice'][1] <= max_price and component['componentPrice'][0] >= min_price:
            filtered_components.append(component)

    return filtered_components


def create_result_components_list(components, shop_filters, min_price_filter, max_price_filter):
    if shop_filters:
        components = filter_by_shop_name(
            components=components,
            shop_names=shop_filters
        )

    # if min_price_filter and max_price_filter:
    #     components = filter_by_price(
    #         components=components,
    #         min_price=min_price_filter,
    #         max_price=max_price_filter
    #     )

    components = sorted(components, key=lambda x: x['componentShopName'])

    return components
