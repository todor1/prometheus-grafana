{
  "apiVersion": "dashboard.grafana.app/v2",
  "kind": "Dashboard",
  "metadata": {
    "name": "addf9j7"
  },
  "spec": {
    "annotations": [
      {
        "kind": "AnnotationQuery",
        "spec": {
          "builtIn": true,
          "enable": true,
          "hide": true,
          "iconColor": "rgba(0, 211, 255, 1)",
          "name": "Annotations & Alerts",
          "query": {
            "datasource": {
              "name": "-- Grafana --"
            },
            "group": "grafana",
            "kind": "DataQuery",
            "spec": {},
            "version": "v0"
          }
        }
      }
    ],
    "cursorSync": "Off",
    "description": "Shows the reate of incoming requests by endpoint",
    "editable": true,
    "elements": {
      "panel-1": {
        "kind": "Panel",
        "spec": {
          "data": {
            "kind": "QueryGroup",
            "spec": {
              "queries": [
                {
                  "kind": "PanelQuery",
                  "spec": {
                    "hidden": false,
                    "query": {
                      "datasource": {
                        "name": "cfwq1152gpla8d"
                      },
                      "group": "prometheus",
                      "kind": "DataQuery",
                      "spec": {
                        "editorMode": "code",
                        "expr": "sum by(endpoint) (rate(api_requests_total[1m]))",
                        "legendFormat": "__auto",
                        "range": true
                      },
                      "version": "v0"
                    },
                    "refId": "A"
                  }
                }
              ],
              "queryOptions": {},
              "transformations": []
            }
          },
          "description": "Shows the rate of incoming requests by endpoint",
          "id": 1,
          "links": [],
          "title": "Request Rate by Endpoint",
          "transparent": true,
          "vizConfig": {
            "group": "timeseries",
            "kind": "VizConfig",
            "spec": {
              "fieldConfig": {
                "defaults": {
                  "color": {
                    "mode": "palette-classic"
                  },
                  "custom": {
                    "axisBorderShow": false,
                    "axisCenteredZero": false,
                    "axisColorMode": "text",
                    "axisLabel": "",
                    "axisPlacement": "auto",
                    "barAlignment": 0,
                    "barWidthFactor": 0.6,
                    "drawStyle": "line",
                    "fillOpacity": 0,
                    "gradientMode": "none",
                    "hideFrom": {
                      "legend": false,
                      "tooltip": false,
                      "viz": false
                    },
                    "insertNulls": false,
                    "lineInterpolation": "linear",
                    "lineWidth": 1,
                    "pointSize": 5,
                    "scaleDistribution": {
                      "type": "linear"
                    },
                    "showPoints": "auto",
                    "showValues": false,
                    "spanNulls": false,
                    "stacking": {
                      "group": "A",
                      "mode": "none"
                    },
                    "thresholdsStyle": {
                      "mode": "off"
                    }
                  },
                  "thresholds": {
                    "mode": "absolute",
                    "steps": [
                      {
                        "color": "green",
                        "value": 0
                      },
                      {
                        "color": "red",
                        "value": 80
                      }
                    ]
                  }
                },
                "overrides": []
              },
              "options": {
                "legend": {
                  "calcs": [],
                  "displayMode": "list",
                  "placement": "bottom",
                  "showLegend": true
                },
                "tooltip": {
                  "hideZeros": false,
                  "mode": "single",
                  "sort": "none"
                }
              }
            },
            "version": "13.2.0"
          }
        }
      },
      "panel-2": {
        "kind": "Panel",
        "spec": {
          "data": {
            "kind": "QueryGroup",
            "spec": {
              "queries": [
                {
                  "kind": "PanelQuery",
                  "spec": {
                    "hidden": false,
                    "query": {
                      "datasource": {
                        "name": "cfwq1152gpla8d"
                      },
                      "group": "prometheus",
                      "kind": "DataQuery",
                      "spec": {
                        "editorMode": "code",
                        "expr": "sum(rate(api_requests_total{status='500'}[1m]))",
                        "legendFormat": "__auto",
                        "range": true
                      },
                      "version": "v0"
                    },
                    "refId": "A"
                  }
                }
              ],
              "queryOptions": {},
              "transformations": []
            }
          },
          "description": "",
          "id": 2,
          "links": [],
          "title": "500 Requests",
          "vizConfig": {
            "group": "timeseries",
            "kind": "VizConfig",
            "spec": {
              "fieldConfig": {
                "defaults": {
                  "color": {
                    "mode": "palette-classic"
                  },
                  "custom": {
                    "axisBorderShow": false,
                    "axisCenteredZero": false,
                    "axisColorMode": "text",
                    "axisLabel": "",
                    "axisPlacement": "auto",
                    "barAlignment": 0,
                    "barWidthFactor": 0.6,
                    "drawStyle": "line",
                    "fillOpacity": 25,
                    "gradientMode": "none",
                    "hideFrom": {
                      "legend": false,
                      "tooltip": false,
                      "viz": false
                    },
                    "insertNulls": false,
                    "lineInterpolation": "linear",
                    "lineWidth": 1,
                    "pointSize": 5,
                    "scaleDistribution": {
                      "type": "linear"
                    },
                    "showPoints": "auto",
                    "showValues": false,
                    "spanNulls": false,
                    "stacking": {
                      "group": "A",
                      "mode": "none"
                    },
                    "thresholdsStyle": {
                      "mode": "off"
                    }
                  },
                  "thresholds": {
                    "mode": "absolute",
                    "steps": [
                      {
                        "color": "green",
                        "value": 0
                      },
                      {
                        "color": "red",
                        "value": 80
                      }
                    ]
                  }
                },
                "overrides": []
              },
              "options": {
                "legend": {
                  "calcs": [],
                  "displayMode": "list",
                  "placement": "bottom",
                  "showLegend": true
                },
                "tooltip": {
                  "hideZeros": false,
                  "mode": "single",
                  "sort": "none"
                }
              }
            },
            "version": "13.2.0"
          }
        }
      }
    },
    "layout": {
      "kind": "RowsLayout",
      "spec": {
        "rows": [
          {
            "kind": "RowsLayoutRow",
            "spec": {
              "collapse": false,
              "layout": {
                "kind": "GridLayout",
                "spec": {
                  "items": [
                    {
                      "kind": "GridLayoutItem",
                      "spec": {
                        "element": {
                          "kind": "ElementReference",
                          "name": "panel-1"
                        },
                        "height": 8,
                        "width": 12,
                        "x": 0,
                        "y": 0
                      }
                    },
                    {
                      "kind": "GridLayoutItem",
                      "spec": {
                        "element": {
                          "kind": "ElementReference",
                          "name": "panel-2"
                        },
                        "height": 8,
                        "width": 12,
                        "x": 12,
                        "y": 0
                      }
                    }
                  ]
                }
              },
              "title": "New row"
            }
          }
        ]
      }
    },
    "links": [],
    "liveNow": false,
    "preferences": {
      "layout": {
        "kind": "GridLayout",
        "spec": {
          "items": []
        }
      }
    },
    "preload": false,
    "tags": [],
    "timeSettings": {
      "autoRefresh": "",
      "autoRefreshIntervals": [
        "5s",
        "10s",
        "30s",
        "1m",
        "5m",
        "15m",
        "30m",
        "1h",
        "2h",
        "1d"
      ],
      "fiscalYearStartMonth": 0,
      "from": "now-1h",
      "hideTimepicker": false,
      "timezone": "browser",
      "to": "now"
    },
    "title": "First dashboard",
    "variables": [
      {
        "kind": "QueryVariable",
        "spec": {
          "allowCustomValue": true,
          "current": {
            "text": "",
            "value": ""
          },
          "hide": "dontHide",
          "includeAll": false,
          "multi": false,
          "name": "query1",
          "options": [],
          "query": {
            "datasource": {
              "name": "cfwq1152gpla8d"
            },
            "group": "prometheus",
            "kind": "DataQuery",
            "spec": {},
            "version": "v0"
          },
          "refresh": "onDashboardLoad",
          "regex": "",
          "regexApplyTo": "value",
          "skipUrlSync": false,
          "sort": "disabled"
        }
      },
      {
        "kind": "QueryVariable",
        "spec": {
          "allowCustomValue": true,
          "current": {
            "text": "",
            "value": ""
          },
          "hide": "dontHide",
          "includeAll": false,
          "multi": false,
          "name": "query1_copy1",
          "options": [],
          "query": {
            "datasource": {
              "name": "cfwq1152gpla8d"
            },
            "group": "prometheus",
            "kind": "DataQuery",
            "spec": {},
            "version": "v0"
          },
          "refresh": "onDashboardLoad",
          "regex": "",
          "regexApplyTo": "value",
          "skipUrlSync": false,
          "sort": "disabled"
        }
      }
    ]
  }
}