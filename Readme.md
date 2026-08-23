# Hands-On Introduction to Monitoring with Prometheus&Grafana

<https://www.udemy.com/course/hands-on-introduction-to-monitoring-with-prometheusgrafana/learn/lecture/56692855#overview>  

## Getting Started  

```bash
docker --version
docker compose version
docker run -d --name prometheus -p 9090:9090 prom/prometheus
docker ps
```

<http://localhost:9090/query>  

<http://localhost:9090/targets> 

<http://localhost:9090/metrics>  

Look up: prometheus_http_requests_total  ->  execute  
<http://localhost:9090/query?g0.expr=prometheus_http_requests_total&g0.show_tree=0&g0.tab=graph&g0.range_input=1h&g0.res_type=auto&g0.res_density=medium&g0.display_mode=lines&g0.show_exemplars=0>  


Status  -> Configuration  

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
  metric_name_validation_scheme: utf8
  scrape_native_histograms: false
  extra_scrape_metrics: false
runtime:
  gogc: 75
alerting:
  alertmanagers:
  - follow_redirects: true
    enable_http2: true
    scheme: http
    timeout: 10s
    api_version: v2
    static_configs:
    - targets: []
scrape_configs:
- job_name: prometheus
  honor_timestamps: true
  track_timestamps_staleness: false
  scrape_interval: 15s
  scrape_timeout: 10s
  scrape_protocols:
  - PrometheusProto
  - OpenMetricsText1.0.0
  - OpenMetricsText0.0.1
  - PrometheusText1.0.0
  - PrometheusText0.0.4
  scrape_native_histograms: true
  always_scrape_classic_histograms: false
  convert_classic_histograms_to_nhcb: false
  metrics_path: /metrics
  scheme: http
  enable_compression: true
  metric_name_validation_scheme: utf8
  metric_name_escaping_scheme: allow-utf-8
  extra_scrape_metrics: false
  follow_redirects: true
  enable_http2: true
  static_configs:
  - targets:
    - localhost:9090
    labels:
      app: prometheus
storage:
  tsdb:
    outofordertimewindow: 0
    retention:
      time: 15d
otlp:
  translation_strategy: UnderscoreEscapingWithSuffixes
  label_name_underscore_sanitization: true
  label_name_preserve_multiple_underscores: true

```
