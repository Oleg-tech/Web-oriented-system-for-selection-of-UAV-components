def filter_by_shop_name(components, shop_names):
    shop_names = [name.lower() for name in shop_names.split(',')]

    filtered_components = [
        component for component in components if component['componentShopName'].lower() in shop_names
    ]

    return filtered_components


def filter_by_price(components, min_price: float, max_price: float):
    filtered_components = []

    for component in components:
        price_range = str(component['componentPrice']).split(' - ')

        if len(price_range) == 2:
            min_component_price = float(price_range[0])
            max_component_price = float(price_range[1])

            if min_price <= max_component_price and max_price >= min_component_price:
                filtered_components.append(component)

        else:
            single_price = float(price_range[0])
            if min_price <= single_price <= max_price:
                filtered_components.append(component)

    return filtered_components


def sort_components(components, sorting_by):
    sorted_components = []

    sorted_components = components

    return sorted_components


def create_result_components_list(components, shop_filters, min_price_filter, max_price_filter, sorting):
    if shop_filters:
        components = filter_by_shop_name(
            components=components,
            shop_names=shop_filters
        )

    # if min_price_filter and max_price_filter:
    #     components = filter_by_price(
    #         components=components,
    #         min_price=float(min_price_filter),
    #         max_price=float(max_price_filter)
    #     )

    # if sorting:
    #     components = sort_components(
    #         components=components,
    #         sorting_by=sorting
    #     )

    components = sorted(components, key=lambda x: x['componentShopName'])

    return components
