from pathlib import Path
import re
import time

import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

from config import PRODUCTS


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = DATA_DIR / "prices.csv"


def clean_price(value):
    value = value.strip()
    value = re.sub(r"[^0-9.]", "", value)
    return float(value) if value else None


def build_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1365,900")
    return webdriver.Chrome(options=options)


def scrape_saucedemo(driver, item):
    driver.get(item["url"])
    time.sleep(1)

    # SauceDemo is a simple public test site.
    # These credentials are provided by the site itself.
    username = driver.find_element(By.ID, "user-name")
    password = driver.find_element(By.ID, "password")

    username.send_keys("standard_user")
    password.send_keys("secret_sauce")
    driver.find_element(By.ID, "login-button").click()
    time.sleep(1)

    soup = BeautifulSoup(driver.page_source, "html.parser")
    products = soup.select(item["selector"])

    rows = []

    for product in products:
        name = product.select_one(".inventory_item_name")
        price = product.select_one(".inventory_item_price")

        if not name or not price:
            continue

        rows.append(
            {
                "product": name.get_text(strip=True),
                "price": clean_price(price.get_text(strip=True)),
                "currency": "USD",
                "source": "SauceDemo",
            }
        )

    return rows


def main():
    DATA_DIR.mkdir(exist_ok=True)

    driver = build_driver()
    rows = []

    try:
        for item in PRODUCTS:
            if "saucedemo.com" in item["url"]:
                rows.extend(scrape_saucedemo(driver, item))
    finally:
        driver.quit()

    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_FILE, index=False)

    print(f"Saved {len(df)} records to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
