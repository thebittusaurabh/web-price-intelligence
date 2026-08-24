# Web Price Intelligence

A small Python project that collects product price information from a few public demo pages and saves the results to CSV.

## What it does

- Opens product pages with Selenium
- Reads product name and price with CSS selectors
- Cleans the price text
- Saves results to `data/prices.csv`
- Keeps the scraper code simple so selectors can be changed easily

## Setup

```bash
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install packages:

```bash
pip install -r requirements.txt
```

Run:

```bash
python src/scraper.py
```

The CSV file will be created under `data/`.

## Notes

This is a learning project. Website layouts and selectors can change, so selectors may need to be updated when a target page changes.
