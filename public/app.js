function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function initCatalog() {
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const inStockOnly = document.getElementById("in-stock-only");
  const maxLeadTime = document.getElementById("max-lead-time");
  const clearBtn = document.getElementById("clear-filters");
  const body = document.getElementById("results-body");
  const status = document.getElementById("results-status");
  const noResults = document.getElementById("no-results");

  async function load() {
    const params = new URLSearchParams({
      q: searchInput.value.trim(),
      category: categoryFilter.value,
      inStock: inStockOnly.checked ? "true" : "false",
      maxLeadTime: maxLeadTime.value,
    });
    const data = await fetchJson(`/api/parts?${params}`);
    body.replaceChildren();
    if (data.count === 0) {
      noResults.classList.remove("hidden");
      status.textContent = "No parts match your filters";
      return;
    }
    noResults.classList.add("hidden");
    status.textContent = `Showing ${data.count} part${data.count === 1 ? "" : "s"}`;
    for (const part of data.results) {
      const tr = document.createElement("tr");
      tr.dataset.testid = "results-row";
      tr.dataset.partId = part.id;
      tr.innerHTML = `
        <td class="mono" data-testid="cell-part-number">${part.partNumber}</td>
        <td data-testid="cell-description">${part.description}</td>
        <td data-testid="cell-stock">${part.stockQty.toLocaleString()}</td>
        <td data-testid="cell-lead-time">${part.leadTimeDisplay}</td>
        <td><a href="/part.html?id=${encodeURIComponent(part.id)}" data-testid="view-part-link">View</a></td>
      `;
      body.appendChild(tr);
    }
  }

  const schedule = debounce(load, 200);
  searchInput.addEventListener("input", schedule);
  categoryFilter.addEventListener("change", load);
  inStockOnly.addEventListener("change", load);
  maxLeadTime.addEventListener("change", load);
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    inStockOnly.checked = false;
    maxLeadTime.value = "any";
    load();
  });
  load();
}

function initPart() {
  const id = qs("id");
  const title = document.getElementById("part-title");
  const details = document.getElementById("part-details");
  const qtyInput = document.getElementById("add-qty");
  const addBtn = document.getElementById("add-to-cart");
  const message = document.getElementById("add-message");

  if (!id) {
    title.textContent = "Part not found";
    return;
  }

  fetchJson(`/api/parts/${encodeURIComponent(id)}`).then(({ part }) => {
    title.textContent = part.partNumber;
    const leadText = part.leadTimeWeeks + " wk";
    details.innerHTML = `
      <dt>Description</dt><dd data-testid="detail-description">${part.description}</dd>
      <dt>Manufacturer</dt><dd data-testid="detail-manufacturer">${part.manufacturer}</dd>
      <dt>Stock on hand</dt><dd data-testid="detail-stock">${part.stockQty.toLocaleString()}</dd>
      <dt>Lead time</dt><dd data-testid="detail-lead-time">${leadText}</dd>
      <dt>Packaging</dt><dd data-testid="detail-packaging">${part.packagingType}</dd>
    `;
    addBtn.addEventListener("click", async () => {
      const quantity = Number(qtyInput.value);
      await fetchJson("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId: part.id, quantity }),
      });
      message.textContent = `Added ${quantity} to cart.`;
    });
  });
}

function initCart() {
  const linesEl = document.getElementById("cart-lines");
  const emptyEl = document.getElementById("cart-empty");
  const clearBtn = document.getElementById("clear-cart");

  async function render() {
    const { items } = await fetchJson("/api/cart");
    linesEl.replaceChildren();
    if (!items.length) {
      emptyEl.classList.remove("hidden");
      return;
    }
    emptyEl.classList.add("hidden");
    for (const line of items) {
      const part = line.part;
      const div = document.createElement("div");
      div.className = "cart-line";
      div.dataset.testid = "cart-line";
      div.innerHTML = `
        <div class="mono" data-testid="cart-part-number">${part.partNumber}</div>
        <div data-testid="cart-stock">Stock on hand: ${part.stockQty.toLocaleString()}</div>
        <label>Quantity <input type="number" min="1" value="${line.quantity}" data-testid="cart-qty-input" data-part-id="${part.id}" /></label>
        <button type="button" data-testid="cart-update" data-part-id="${part.id}">Update line</button>
      `;
      linesEl.appendChild(div);
    }
    linesEl.querySelectorAll("[data-testid=cart-update]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const partId = btn.getAttribute("data-part-id");
        const input = linesEl.querySelector(`input[data-part-id="${partId}"]`);
        const quantity = Number(input.value);
        await fetchJson("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partId, quantity }),
        });
        render();
      });
    });
  }

  clearBtn.addEventListener("click", async () => {
    await fetchJson("/api/cart", { method: "DELETE" });
    render();
  });

  render();
}

const page = document.body.getAttribute("data-page");
if (page === "catalog") initCatalog();
if (page === "part") initPart();
if (page === "cart") initCart();
