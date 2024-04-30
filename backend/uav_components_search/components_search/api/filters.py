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


def sort_from_cheap(components) -> list:
    return sorted(components, key=lambda x: float(str(x["componentPrice"]).split('-')[0]), reverse=False)


def sort_from_expensive(components) -> list:
    return sorted(components, key=lambda x: float(str(x["componentPrice"]).split('-')[0]), reverse=True)


def sort_components(components, sorting_by):
    if sorting_by == 'most_appropriate':
        return components
    if sorting_by == 'cheapest':
        return sort_from_cheap(components=components)
    if sorting_by == 'expensive':
        return sort_from_expensive(components=components)

    return components


def create_result_components_list(components, shop_filters, min_price_filter, max_price_filter, sorting):
    if shop_filters:
        components = filter_by_shop_name(
            components=components,
            shop_names=shop_filters
        )

    if min_price_filter and max_price_filter:
        components = filter_by_price(
            components=components,
            min_price=float(min_price_filter),
            max_price=float(max_price_filter)
        )

    if sorting:
        components = sort_components(
            components=components,
            sorting_by=sorting
        )

    # components = sorted(components, key=lambda x: x['componentShopName'])

    return components


def get_min_and_max(components):
    if len(components) == 0:
        return None, None

    min_value = 0
    max_value = components[0]['componentPrice']

    for component in components:
        price_range = str(component['componentPrice']).split(' - ')

        if len(price_range) == 2:
            if int(float(price_range[0])) < min_value:
                min_value = int(float(price_range[0]))
            if int(float(price_range[1])) > max_value:
                max_value = int(float(price_range[1]))
        elif len(price_range) == 1:
            price = int(float(price_range[0]))

            if price < min_value:
                min_value = price
            if price > max_value:
                max_value = price

    return min_value, max_value
