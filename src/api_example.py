import requests


def get_demo_data():
    url = "https://dummyjson.com/products?limit=5"

    response = requests.get(url, timeout=10)
    response.raise_for_status()

    return response.json()


if __name__ == "__main__":
    data = get_demo_data()

    for product in data.get("products", []):
        print(product["title"], "-", product["price"])
