const metrics = [
  {
    name: "Performance",
    important: true,
    database: "lighthouse",
    measurement: "performance-score",
    select: `mean("value")`,
    thresholds: [50, 90]
  },
  {
    name: "Progressive Web App",
    database: "lighthouse",
    measurement: "pwa-score",
    select: `mean("value")`,
    thresholds: [50, 90]
  },
  {
    name: "Accessibility",
    database: "lighthouse",
    measurement: "accessibility-score",
    select: `mean("value")`,
    thresholds: [50, 90]
  },
  {
    name: "Best Practice",
    database: "lighthouse",
    measurement: "best-practices-score",
    select: `mean("value")`,
    thresholds: [50, 90]
  },
  {
    name: "Seo Score",
    database: "lighthouse",
    measurement: "seo-score",
    select: `mean("value")`,
    thresholds: [50, 90]
  },
  {
    name: "Links integrity",
    database: "linksintegrity",
    measurement: "linksintegrity",
    select: `mean("value")`,
    thresholds: [95, 99]
  },
  {
    name: "Encryption (TLS)",
    important: true,
    database: "ssllabs",
    measurement: "ssl_score",
    select: `mean("value")`,
    thresholds: [1, 90]
  },
  {
    name: "Securityheaders.com",
    important: true,
    database: "securityheaders",
    measurement: "header_score",
    select: `mean("value")`,
    thresholds: [20, 90]
  },
  {
    name: "Securityheaders(mozilla)",
    database: "securityheaders",
    measurement: "mozilla_score",
    select: `mean("value")`,
    thresholds: [25, 70]
  },
  {
    name: "Uptime(30days)",
    important: true,
    database: "uptimerobot",
    measurement: "uptime_score",
    select: `mean("value")`,
    thresholds: [95, 99]
  },
  {
    name: "Server errors(30)",
    database: "sentry-metrics",
    measurement: "ServerErrors/TotalVisits",
    select: `mean("value_30days")`,
    thresholds: [95, 99]
  },
  {
    name: "JS errors(30)",
    database: "sentry-metrics",
    measurement: "JsEvents/TotalVisits",
    select: `mean("value_30days")`,
    thresholds: [95, 99]
  },
  {
    name: "Test coverage",
    database: "sonarqube",
    measurement: "coverage_rating",
    select: `mean("value")`,
    thresholds: [30, 80]
  },
  {
    name: "Bugs",
    database: "sonarqube",
    measurement: "security_rating",
    select: `mean("value")`,
    thresholds: [25, 75]
  },
  {
    name: "Vulnerabilities",
    database: "sonarqube",
    measurement: "reliability_rating",
    select: `mean("value")`,
    thresholds: [25, 75]
  },
  {
    name: "Code smells",
    database: "sonarqube",
    measurement: "sqale_rating",
    select: `mean("value")`,
    thresholds: [25, 75]
  },
  {
    name: "Duplication score",
    database: "sonarqube",
    measurement: "non_duplication_rating",
    select: `mean("value")`,
    thresholds: [80, 95]
  },
  {
    name: "Privacyscore",
    important: true,
    database: "privacyscore",
    measurement: "privacyscore",
    select: `mean("value")`,
    thresholds: [50, 90]
  },
  {
    name: "Webbkoll",
    important: true,
    database: "webbkoll",
    measurement: "webbkoll",
    select: `mean("value")`,
    thresholds: [50, 90]
  },
]

const onDemandApis = [
  {
    database: "linksintegrity",
    url: "http://garie-linksintegrity:3000",
  },
  {
    database: "ssllabs",
    url: "http://garie-ssllabs:3000",
  },
]

module.exports = {
  metrics,
  onDemandApis,
}
