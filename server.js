const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 3847;
const PUBLIC_DIR = path.join(__dirname, "public");
const PARTS_PATH = path.join(__dirname, "data", "parts.json");

const partsData = JSON.parse(fs.readFileSync(PARTS_PATH, "utf8"));
const partsById = new Map(partsData.parts.map((p) => [p.id, p]));

let cart = [];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function matchesSearch(part, q) {
  if (!q) return true;
  const hay = `${part.partNumber} ${part.description} ${part.manufacturer}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

function matchesCategory(part, category) {
  if (!category || category === "all") return true;
  return part.category === category;
}

function matchesInStock(part, inStockOnly) {
  if (!inStockOnly) return true;
  return part.stockQty > 0;
}

function matchesMaxLeadTime(part, maxWeeks) {
  if (maxWeeks === null || maxWeeks === undefined || maxWeeks === "") return true;
  const cap = Number(maxWeeks);
  if (Number.isNaN(cap)) return true;
  if (part.leadTimeWeeks === null) return false;
  return part.leadTimeWeeks < cap;
}

function filterParts({ q = "", category = "all", inStockOnly = false, maxLeadTime = "" }) {
  const cap = maxLeadTime === "" || maxLeadTime === "any" ? null : maxLeadTime;
  return partsData.parts.filter(
    (part) =>
      matchesSearch(part, q) &&
      matchesCategory(part, category) &&
      matchesInStock(part, inStockOnly) &&
      matchesMaxLeadTime(part, cap),
  );
}

function formatLeadTimeList(part) {
  if (part.leadTimeWeeks === null) return "Not listed";
  return `${part.leadTimeWeeks} wk`;
}

function serveStatic(req, res, pathname) {
  const safe = pathname.replace(/\.\./g, "");
  const filePath = path.join(PUBLIC_DIR, safe === "/" ? "index.html" : safe);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

async function handleApi(req, res, pathname, searchParams) {
  if (pathname === "/api/parts" && req.method === "GET") {
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "all";
    const inStockOnly = searchParams.get("inStock") === "true";
    const maxLeadTime = searchParams.get("maxLeadTime") || "any";
    const results = filterParts({ q, category, inStockOnly, maxLeadTime }).map((part) => ({
      ...part,
      leadTimeDisplay: formatLeadTimeList(part),
    }));
    sendJson(res, 200, { count: results.length, results });
    return;
  }

  const partMatch = pathname.match(/^\/api\/parts\/([^/]+)$/);
  if (partMatch && req.method === "GET") {
    const part = partsById.get(decodeURIComponent(partMatch[1]));
    if (!part) {
      sendJson(res, 404, { error: "Part not found" });
      return;
    }
    sendJson(res, 200, { part });
    return;
  }

  if (pathname === "/api/cart" && req.method === "GET") {
    const items = cart.map((line) => ({
      ...line,
      part: partsById.get(line.partId),
    }));
    sendJson(res, 200, { items });
    return;
  }

  if (pathname === "/api/cart" && req.method === "POST") {
    const body = await readBody(req);
    const partId = String(body.partId || "").toLowerCase();
    const quantity = Number(body.quantity);
    const part = partsById.get(partId);
    if (!part) {
      sendJson(res, 404, { error: "Part not found" });
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      sendJson(res, 400, { error: "Quantity must be at least 1" });
      return;
    }
    const existing = cart.find((c) => c.partId === partId);
    if (existing) {
      existing.quantity = quantity;
    } else {
      cart.push({ partId, quantity });
    }
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname === "/api/cart" && req.method === "DELETE") {
    cart = [];
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    try {
      await handleApi(req, res, url.pathname, url.searchParams);
    } catch {
      sendJson(res, 400, { error: "Bad request" });
    }
    return;
  }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Brazos Ridge catalog (sample data) at http://127.0.0.1:${PORT}`);
});
