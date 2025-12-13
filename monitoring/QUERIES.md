# Prometheus Monitoring Guide

## 📊 Essential PromQL Queries

Here are the most useful queries to monitor your Medin Connect backend.

### 1. API Performance

**Request Rate (Requests Per Second)**
Rate of requests over the last 5 minutes.
```promql
rate(http_request_duration_seconds_count[5m])
```

**Error Rate (%)**
Percentage of requests returning 5xx status codes.
```promql
sum(rate(http_request_duration_seconds_count{http_status_code=~"5.*"}[5m])) / 
sum(rate(http_request_duration_seconds_count[5m])) * 100
```

**95th Percentile Latency**
The maximum time 95% of your requests take (excludes the slowest 5%).
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

### 2. Database (Prisma)

**Query Rate**
Number of database queries per second.
```promql
rate(prisma_client_queries_total[5m])
```

**Slow Queries (>500ms)**
Count of queries taking longer than 500ms.
```promql
rate(prisma_client_query_duration_histogram_bucket{le="+Inf"}[5m]) - 
rate(prisma_client_query_duration_histogram_bucket{le="0.5"}[5m])
```

### 3. System Resources

**CPU Usage (%)**
```promql
rate(process_cpu_seconds_total[1m]) * 100
```

**Memory Usage (MB)**
Heap memory used by the Node.js process.
```promql
nodejs_heap_size_used_bytes / 1024 / 1024
```

---

## 🚨 Recommended Alert Rules

You can add these to a `rules.yml` file for Alertmanager.

### High Error Rate Alert
Trigger if error rate > 5% for 5 minutes.
```yaml
- alert: HighErrorRate
  expr: (sum(rate(http_request_duration_seconds_count{http_status_code=~"5.*"}[5m])) / sum(rate(http_request_duration_seconds_count[5m]))) * 100 > 5
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: High error rate detected
```

### Slow API Response Alert
Trigger if p95 latency > 1 second for 5 minutes.
```yaml
- alert: HighLatency
  expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: API responses are slow (>1s)
```

### High Memory Usage
Trigger if heap usage > 500MB.
```yaml
- alert: HighMemoryUsage
  expr: nodejs_heap_size_used_bytes > 500 * 1024 * 1024
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High memory usage detected
```
