let products = [];

const $ = (id) => document.getElementById(id);

function money(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function renderTable(list) {
  const body = $("product-table");
  body.innerHTML = "";
  $("empty").hidden = list.length !== 0;

  list.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${item.product}</strong></td>
      <td>${money(item.price)}</td>
      <td>${item.currency || "-"}</td>
      <td>${item.source || "-"}</td>
      <td><span class="status">Collected</span></td>
    `;

    body.appendChild(row);
  });
}

function drawBars(list) {
  const box = $("bars");
  box.innerHTML = "";

  if (!list.length) {
    box.innerHTML = '<div class="empty">No price data yet.</div>';
    return;
  }

  const prices = list.map((item) => Number(item.price) || 0);
  const max = Math.max(...prices, 1);

  list.slice(0, 10).forEach((item) => {
    const wrap = document.createElement("div");
    wrap.className = "bar-wrap";

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height =
      Math.max(8, ((Number(item.price) || 0) / max) * 140) + "px";
    bar.title = `${item.product} — ${money(item.price)}`;

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = money(item.price);

    wrap.append(bar, label);
    box.appendChild(wrap);
  });
}

function updateDashboard(list) {
  $("product-count").textContent = list.length;

  const prices = list
    .map((item) => Number(item.price))
    .filter(Number.isFinite);

  const average = prices.length
    ? prices.reduce((total, value) => total + value, 0) / prices.length
    : 0;

  $("average-price").textContent = money(average);
  $("lowest-price").textContent = money(
    prices.length ? Math.min(...prices) : 0
  );
  $("source").textContent = list.length ? list[0].source || "—" : "—";

  const missing = list.filter(
    (item) => !Number.isFinite(Number(item.price))
  ).length;

  const score = list.length
    ? Math.round((1 - missing / list.length) * 100)
    : 100;

  $("health-score").textContent = score + "%";
  $("health-records").textContent = list.length;
  $("missing-prices").textContent = missing;

  $("health-text").textContent = missing
    ? "Some records need review."
    : "All collected records passed basic validation.";

  $("last-updated").textContent = new Date().toLocaleDateString(
    undefined,
    { day: "2-digit", month: "short", year: "numeric" }
  );

  drawBars(list);
  renderTable(list);
}

function filterAndSort() {
  const query = $("global-search").value.toLowerCase().trim();

  let list = products.filter((item) =>
    (item.product || "").toLowerCase().includes(query)
  );

  const sort = $("sort").value;

  if (sort === "high") {
    list.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  if (sort === "low") {
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
  }

  if (sort === "name") {
    list.sort((a, b) =>
      (a.product || "").localeCompare(b.product || "")
    );
  }

  renderTable(list);
}

async function loadProducts() {
  try {
    const response = await fetch("../data/prices.json?" + Date.now());

    if (!response.ok) {
      throw new Error("Dataset not found");
    }

    products = await response.json();
    updateDashboard(products);
  } catch (error) {
    products = [];
    updateDashboard([]);

    $("health-text").textContent =
      "Run scraper.py to generate the dataset.";
    $("last-updated").textContent = "No dataset";
  }
}

$("global-search").addEventListener("input", filterAndSort);
$("sort").addEventListener("change", filterAndSort);
$("refresh").addEventListener("click", loadProducts);

loadProducts();
