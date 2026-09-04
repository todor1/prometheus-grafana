const express = require("express");
const promClient = require("prom-client");

const app = express();
const PORT = 3001;

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const requestCounter = new promClient.Counter({
  name: "api_requests_total",
  help: "Total number of API requests",
  labelNames: ["method", "endpoint", "status"],
  registers: [register],
});

const activeConnections = new promClient.Gauge({
  name: "api_active_connections",
  help: "Number of active connections",
  registers: [register],
});

const requestDuration = new promClient.Histogram({
  name: "api_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "endpoint"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

app.get("/api/users", (req, res) => {
  const start = Date.now();
  activeConnections.inc();

  setTimeout(() => {
    const duration = (Date.now() - start) / 1000;
    requestDuration.labels("GET", "/api/users").observe(duration);
    requestCounter.labels("GET", "/api/users", "200").inc();
    activeConnections.dec();

    res.json({ users: ["Alice", "Bob", "Charlie"] });
  }, Math.random() * 500);
});

app.get("/api/products", (req, res) => {
  const start = Date.now();
  activeConnections.inc();

  setTimeout(() => {
    const duration = (Date.now() - start) / 1000;
    requestDuration.labels("GET", "/api/products").observe(duration);

    if (Math.random() < 0.2) {
      requestCounter.labels("GET", "/api/products", "500").inc();
      activeConnections.dec();
      res.status(500).json({ error: "Internal server error" });
    } else {
      requestCounter.labels("GET", "/api/products", "200").inc();
      activeConnections.dec();
      res.status(500).json({ products: ["Laptop", "Phone", "Tablet"] });
    }
  }, Math.random() * 1000);
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Demo app listening on http://localhost:${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
