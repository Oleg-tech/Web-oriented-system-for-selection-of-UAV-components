import re


currency_values = {
    "UAH": 1.0,
    "USD": 39.6037,
    "GBP": 49.3858,
    "EUR": 42.2789
}


def convert_to_uah(value, currency):
    return value * currency_values[currency]


def extract_price(price_str, pattern, has_price_interval, separator, currency):
    try:
        print("Initial = ", price_str)
        # print("Encoded = ", price_str.encode('utf-8').decode('utf-8'))

        # Декодування рядка з використанням кодування cp1251
        # price_str = price_str.encode('cp1251').decode('cp1251')
        # separator = separator.encode('cp1251').decode('cp1251')
        # print("Decoded =", price_str)

        parts = [price_str]
        if separator and price_str.find(separator):
            print("Separator = ", separator)
            parts = price_str.replace('\xa0', '').split(separator)
        print("Parts = ", parts)

        if not has_price_interval:
            match = re.search(pattern, parts[-1])
            if match:
                price = float(match.group(1).replace(',', '').replace(' ', ''))
                print("Before convert 1 = ", price)
                return convert_to_uah(price, currency)

        # Finish this part
        if len(parts) > 2:
            print("Сталась помилка при конвертації ціни")
            return

        if len(parts) == 1:
            match = re.search(pattern, parts[-1])
            if match:
                price = float(match.group(1).replace(',', '').replace(' ', ''))
                return price

        interval_price_1 = float(parts[0].strip().replace(',', '').replace(' ', ''))

        compiled_pattern = re.compile(pattern)
        # print("Pattern = ", compiled_pattern)
        interval_match_2 = compiled_pattern.search(parts[1])
        # print(f"I1 = {interval_price_1} I2 = {interval_match_2}")

        if interval_match_2:
            interval_price_2 = float(interval_match_2.group(1).replace(',', '').replace(' ', ''))

            # print(f"Intervals = {interval_price_1} - {interval_price_2}")

            # return [interval_price_1, interval_price_2]
            return f"{interval_price_1} - {interval_price_2}"
    except:
        print("HERE")
        return price_str
