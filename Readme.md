# Hands-On Introduction to Monitoring with Prometheus&Grafana  

<https://www.udemy.com/course/hands-on-introduction-to-monitoring-with-prometheusgrafana/learn/lecture/56692855#overview>  

## Prometheus Getting Started  

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

### Prometheus Queries (PromQL)  

prometheus_http_requests_total{handler="/metrics"}
prometheus_http_requests_total{handler=~"/api.*"}

rate(prometheus_http_requests_total{code="200", handler="/metrics"}[1m])
rate(prometheus_http_requests_total[5m]) * 60

Right click on the 3 dots before the Execute button -> Explore metrics

up == 1
prometheus_http_requests_total offset 5m
increase(prometheus_http_requests_total[5m])
sum(rate(prometheus_http_requests_total[5m]))
count(prometheus_http_requests_total)
sum by(code) (rate(prometheus_http_requests_total[5m]))

sum(rate(prometheus_http_requests_total{code=~"5.."}[5m])) / sum(rate(prometheus_http_requests_total[5m])) * 100
sum(rate(prometheus_http_requests_total{code=~"2.."}[5m])) / sum(rate(prometheus_http_requests_total[5m])) * 100
sum(rate(prometheus_http_requests_total{code!="200"}[5m])) / sum(rate(prometheus_http_requests_total[5m])) * 100

avg(go_goroutines)
topk(3, rate(prometheus_http_requests_total[5m]))



### Prometheus Change Config  

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


### Demo App Node.js  

Node shell commands  

```bash
mkdir demo-app
cd demo-app
node --version
npm -v

npm init -y
npm install express prom-client

node index.js 


```

Prometheus on Docker shell  

```bash
docker ps
docker stop prometheus
docker rm prometheus

code demo-app/prometheus.yaml
mv demo-app/prometheus.yaml .
cat prometheus.yaml

# linux command (native Linux Docker)
# docker run -d --name prometheus -p 9090:9090 -v $(pwd)/prometheus.yaml:/etc/prometheus/prometheus.yml prom/prometheus

# Windows Bash Command (Git Bash + Docker Desktop) ✅ working
# MSYS_NO_PATHCONV=1  -> stop Git Bash mangling the container path (/etc/...) into a Windows path
# $(cygpath -m "$PWD") -> host-side path in Windows format (C:/...), which Docker Desktop needs
MSYS_NO_PATHCONV=1 docker run -d --name prometheus -p 9090:9090 \
  -v "$(cygpath -m "$PWD")/prometheus.yaml:/etc/prometheus/prometheus.yml" prom/prometheus

# Reload config after editing prometheus.yaml (SIGHUP; the /-/reload API needs --web.enable-lifecycle):
# docker kill --signal=SIGHUP prometheus
```

Names of services set up in the [index file](demo-app/index.js) visible under Prometheus menu Query/... Explore metrics: 
 - api_requests_total
 - api_active_connections
 - ...  

rate(api_requests_total[1m])


## Issues  

### `docker run` → "Conflict. The container name \"/prometheus\" is already in use"  

**Symptom**  
```text
docker: Error response from daemon: Conflict. The container name "/prometheus" is already in use by container "<id>". You have to remove (or rename) that container to be able to reuse that name.
```

**Cause** — A previous container named `prometheus` still exists (even if it has already exited — e.g. it was stopped or received a termination signal). Docker only allows **one** container per name, so `docker run` with `--name prometheus` fails until the old one is gone.

**Fix**  
```bash
docker rm -f prometheus     # force-remove the stale container (or: docker stop prometheus && docker rm prometheus)
docker ps                  # confirm nothing named prometheus remains
# then re-run the "Windows Bash Command" (or linux command) above
```

### Mounted `prometheus.yaml` is ignored → Prometheus runs its default config (Git Bash path mangling)  

**Symptom** — Prometheus starts fine, but the Targets page only lists `prometheus` (`localhost:9090`); the `demo-app` job is missing. Evidence:
- `docker inspect prometheus --format '{{json .Mounts}}'` shows a garbage mount, e.g. `Source: "...prometheus.yaml;C"` and `Destination: "\Users\...\Git\etc\prometheus\prometheus.yml"` (pointing into the Git install folder).
- `docker exec prometheus cat /etc/prometheus/prometheus.yml` fails — the container path is rewritten to `C:\Users\...\Git\etc\prometheus\prometheus.yml`.
- Status → Configuration shows Prometheus's **built-in default** config (auto-generated `alerting`/`otlp`/`runtime` blocks, no `demo-app` job).

**Cause** — Git Bash (MSYS) auto-converts Unix-style paths in command arguments into Windows paths. In `-v $(pwd)/prometheus.yaml:/etc/prometheus/prometheus.yml` the container-side `/etc/prometheus/prometheus.yml` gets rewritten, so the bind mount never attaches to the real file and Prometheus silently falls back to the image's default config.

**Fix** — Disable path conversion and pass the host path in Windows format (the `Windows Bash Command` above):  
```bash
MSYS_NO_PATHCONV=1 docker run -d --name prometheus -p 9090:9090 \
  -v "$(cygpath -m "$PWD")/prometheus.yaml:/etc/prometheus/prometheus.yml" prom/prometheus
```

**Verify** — `docker inspect prometheus --format '{{json .Mounts}}'` should show `Source: C:/Users/.../prometheus.yaml` → `Destination: /etc/prometheus/prometheus.yml`, and Status → Configuration should list **both** the `prometheus` and `demo-app` jobs.

### Note: reaching host services from a container on Docker Desktop  

`172.17.0.1` (the native-Linux Docker bridge gateway) is **not** reachable from inside a container on Docker Desktop. Use `host.docker.internal` in scrape targets instead — e.g. the `demo-app` target in `prometheus.yaml` is `host.docker.internal:3001`. (The Grafana section below documents the equivalent Grafana → Prometheus URL gotcha.)


## Grafana Getting Started  

```bash
docker ps
docker run -d --name grafana -p 3000:3000 grafana/grafana
```  

For default login Grafana uses **admin** as user and password. 
Then immediately prompts for a user defined credentials.
For learning only, we may skip the step.  

### Connect Grafana to Prometheus  

(Administration sections previously holded the data sources configs)

 1) Connections
 2) Add new connection  
 3) Search for Prometheus  
 4) Add new data source  
 5) (Prometheus URL: http://host.docker.internal:9090)
 6) Prometheus URL: **http://172.17.0.1:9090**  ✅ verified working on this machine (2026-08-30)
 7) Save & test
 8) Go to Data sources -> Prometheus -> Explore
 9) Select metric 

> Notes:
> - It's `172.17.0.1` (course typo said `127.17.0.1`) — the **Docker bridge gateway**.
> - `host.docker.internal` also resolves inside the Grafana container on Docker Desktop
>   (→ `192.168.65.254`), but the gateway IP is the reliable cross-OS option.

```bash
# Get the Docker bridge gateway IP (the docker0 / 172.17.0.1 interface from the course)
docker network inspect bridge --format '{{(index .IPAM.Config 0).Gateway}}'
# → 172.17.0.1

# Verify Grafana → Prometheus with a TCP request (from inside the container)
docker exec grafana sh -c 'wget -qO- --timeout=3 http://172.17.0.1:9090/-/healthy'
# → Prometheus Server is Healthy.
```

#### Windows 11: `ip a` equivalents (Git Bash / PowerShell)

`ip a` doesn't exist on Windows — use `ipconfig`:

```bash
# Git Bash / PowerShell
ipconfig
ipconfig //all      # Git Bash: double slash so /all isn't mangled as a path
```

```powershell
# PowerShell (nicer output)
Get-NetIPAddress -AddressFamily IPv4 | Format-Table InterfaceAlias, IPAddress
```

> ⚠️ But the `ipconfig` IPs are **NOT** what Grafana needs! On Windows, Docker Desktop
> runs containers behind a WSL2 NAT. The "Docker host" reachable from *inside* a
> container is the **bridge gateway** (`docker network inspect bridge` above), not any
> adapter listed by `ipconfig`.

#### Why `ping host.docker.internal` "doesn't work" (and why that's fine)

- `ping` uses **ICMP**, which containers usually don't answer — and minimal container
  images often lack the `ping` binary. A failed ping does **not** mean the URL is broken.
- `host.docker.internal` *does* resolve inside the Grafana container on Docker Desktop
  (→ `192.168.65.254`); it only fails from the host shell or on Linux without Docker Desktop.
- Test connectivity with a **TCP** request (wget/curl above), not ping.
- Also: `ping` takes a host/IP only — never `http://...` (the course notes had that too).

#### Cleanest option (the course's "fix it properly"): same network + service name

On a **user-defined** network, Docker DNS resolves container names, so no IP is needed:

```bash
docker network create monitoring
docker network connect monitoring prometheus
docker run -d --name grafana --network monitoring -p 3000:3000 grafana/grafana
# Grafana Prometheus URL: http://prometheus:9090
```

> Note: the default `bridge` network has no DNS for container names — that's why
> `http://prometheus:9090` only works on a *user-defined* network like the above.

Transcript:  
> ...
So we are having this localhost 9090, but what would actually happen here?  
And here's the actually a gotcha in this Docker environment. 
From inside the Grafana container, which we are running this UI on, because you need to 
be mindful that if we are right now in the localhost 3000, we are actually on a localhost, 
but we are, let's say, tunneled into the local container, into the Grafana container. 
So localhost written here actually refers to the container itself, not the host machine. 
So we can't use this localhost 9090 right now, because the Prometheus would be looked 
at inside of the Grafana container, which is not the case. 
Instead, we need to use our local machine, actual network address, or use the Docker 
special DNS names for that. 
So the easiest approach to use would be the Docker internal, which is a special host name 
that Docker provides to reach the host machine from inside of the container. 
So those are the two approaches that we can take here. 
So let's go with one of them. 
And in the URL field, we will type this local DNS. 
I will do it this way. 
I will do a host Docker internal, and I will do a 9090 here. 
And this will tell Grafana to connect to a port 9090 on the host machine. 
So this host Docker internal would resolve to more or less the same thing as I would do with APA. 
So my IP address for my local interfaces here, so I would be able to pass test, but I can 
also do this ping host internal host Docker internal. 
And I'm getting a name or service not known because that's a little bit of a Linux gacha another one. 
It might not work by default. 
And in that case, I would actually use my IP. 
So I will, I'm showing you both ways, but usually IP is the better one. 
And IP can actually be taken on both things. 
So I can take this main IP or actually you can see here is the Docker zero interface 
with this 172.17.0.1. 
And this is actually the Docker bridge network gateway, or better yet, we can fix this properly. 
For example, putting both containers on the same network. 
So now let's actually go back down here and I will change that. 
I'm just mentioning all of those things because depending on the operating system you are 
running and depending on the approach you took, either an installation, either a Docker 
and so on, that can be a little bit different for you. 
And there can be some gachas to solve along the way. 
But for now, let's leave it as it is. 
And we can see some other settings here, right? 
So most of them can stay as they are right now by default. 
And at the bottom of the page, we should see just save and test. 
So let's do it because Grafana will actually try to attempt a connection to Prometheus 
and verify it's working. 
We can see successful query, the Prometheus RPI. 
Next, you can start to visualize your data by building a dashboard from scratch. 
So we see a success. 
And I hope if you are following along, you also see a success. 
If you are not seeing a success, you would probably need to see if the Docker is running by Docker PS. 
You can also go to the UI, see if the Prometheus is still running. 
But the most important and the crucial thing would be probably the URL, depending on the 
approach you took. 
But Grafana, for me, right away, successfully created Prometheus and got a response. 
So as we are already added, what we would do next here? 
We will go back to the data sources here. 
And now you can see we have our first data source. 
Data source at HTTP, this 172, so the Docker bridge 9090 and the Prometheus. 
So this connection is right now saved and Grafana can use it whenever we will query 
Prometheus data in a dashboard that we will actually create. 
So maybe on top of that, before we will proceed to the dashboards actually, let's do a quick 
test to make sure that everything is working. 
I will go here to the Explorer. 
It's like a compass here. 
And this is where we can do Grafana's query. 
This will be the similar concept to what we did in Prometheus query interface. 
But you can see there are a lot more options here. 
So at the top, you would need to be sure that you are querying actually the Prometheus as a data source. 
So this is what we will be querying. 
And here is the metric. 
So we can browse some metrics and you can see right away it's pre-populated with all 
of those things that we saw previously. 
So we can take our app at our app metrics. 
It should be somewhere here. Here it is. 
There is an app. 
So we selected the metric, we selected the data source. 
So let's query that. 
You can see you can query that here. 
So I will run a query and you can see right away, more or less the same visualization 
that we saw in Prometheus. 
But right now, Prometheus just gave us the metrics and this visualization is right now 
done in Grafana. 
And you can see maybe it's a little bit more pleasing to the eye right now, right? 
If I would do an app here one more time, so we can see, let's do graph here. 
It looks more or less the same. 
The most change will actually happen when we will start to do a lot of other things here. 
But for now, it looks more or less the same, but you can see right away there are a lot 
of options to explore. All right. 
I think that let's leave this video at that as we now have both Prometheus and Grafana running. 
We have them connected and we even saw that those connections are working. 
So now we are ready to start explore metrics. 
And on top of that, building those dashboards that we talked so much about already. 
So please join me in the next video.  


#### Grafana DuckDB integration  

Below config taken from gemini. 
Explore further on the DuckDB -> Grafana integration using Docker images.  

```yaml  
version: '3.8'

services:
  grafana:
    # CRITICAL: Use the Ubuntu-based image instead of the default Alpine one
    image: grafana/grafana:latest-ubuntu
    container_name: grafana-duckdb
    ports:
      - "3000:3000"
    environment:
      # Required to install plugins via the CLI during boot
      - GF_INSTALL_PLUGINS=motherduck-duckdb-datasource
      # Required because the plugin is currently unsigned
      - GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=motherduck-duckdb-datasource
    volumes:
      # Optional: Persist Grafana configurations and installed plugins
      - grafana-storage:/var/lib/grafana
      # Strongly Recommended: Map a host folder to access local DuckDB or Parquet files
      - ./local_data:/var/lib/grafana/local_data

volumes:
  grafana-storage:
```  

#### Accessing Local Parquet/DuckDB Files  

Once the container is running and you are configuring the data source via the Grafana UI:
Navigate to Connections -> Data sources -> Add data source and select DuckDB.  
For the Database Path, use the internal container path where your data is mapped (e.g., /var/lib/grafana/local_data/my_database.db). 
If you want to query local Parquet files directly without creating a .db file first, you can reference them using standard DuckDB SQL commands directly inside your Grafana dashboard panels:  

```sql
SELECT * FROM read_parquet('/var/lib/grafana/local_data/metrics.parquet');
```    

#### Connect TimescaleDB to Grafana  

Go to your Grafana sidebar, click on Connections, select Data sources, and click Add data source.  
Select PostgreSQL: Search for and choose PostgreSQL from the list of available database options.  
Configure Connection Details:  
  - Host URL: Enter your database host and port (e.g., localhost:5432 or your cloud provider endpoint formatted as host:port) 
  - Database name: Type the name of your specific database.  
  - Username & Password: Enter your database credentials.  
  - TLS/SSL Mode: Choose disable for local setups or require if using a managed cloud database.  
  - PostgreSQL options: Scroll down to the PostgreSQL details section and enable TimescaleDB to activate native time-series macros and functions.  
  - Save and Test: Click Save & test to verify that the database connection is working properly.

Writing Queries for Visualizations  
 - Time Column Requirement: Grafana expects your query to return a timestamp column named time, or you must alias your timestamp column using SELECT timestamp_column AS time.  
 - Using TimescaleDB Functions: Take advantage of built-in optimizations like time_bucket() to group and aggregate data across arbitrary time intervals smoothly.  
  
```sql
SELECT 
  time_bucket('5 minutes', time) AS time,
  AVG(metric_value) AS value
FROM sensor_data
WHERE $__timeFilter(time)
GROUP BY time
ORDER BY time ASC;
```   

### Grafana Dashboards  

Dashboards  ->  New Dashboard -> New Panel -> Configure Visualization  

Data Source: Prometheus  

 - Queries -> Builder/**Code** 
 - sum by(endpoint) (rate(api_requests_total[1m]))  
 - Run queries 
 - Time series  => Change  ->  All visualizations
 - Builder version is helpful for creating the query based on dropdown settings




# Grafana 11 from ZERO to advanced  

<https://www.udemy.com/course/grafana-from-zero-to-advanced/learn/lecture/43913072#overview>  


  
