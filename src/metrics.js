const metrics = [
  {
    name: "Performance",
    important: true,
    database: "lighthouse",
    query: `SELECT mean("value") AS "value" FROM "performance-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [50, 90]
  },
  {
    name: "Progressive Web App",
    database: "lighthouse",
    query: `SELECT mean("value") AS "value" FROM "pwa-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [50, 90]
  },
  {
    name: "Accessibility",
    database: "lighthouse",
    query: `SELECT mean("value") AS "value" FROM "accessibility-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [50, 90]
  },
  {
    name: "Best Practice",
    database: "lighthouse",
    query: `SELECT mean("value") AS "value" FROM "best-practices-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [50, 90]
  },
  {
    name: "Seo Score",
    database: "lighthouse",
    query: `SELECT mean("value") AS "value" FROM "seo-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [50, 90]
  },
  {
    name: "Links integrity",
    apiUrl: "http://garie-linksintegrity:3000",
    parseResult: (result) => result.linksintegrity,
    database: "linksintegrity",
    query: `SELECT mean("value") AS "value" FROM "linksintegrity" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [95, 99]
  },
  {
    name: "Encryption (TLS)",
    apiUrl: "http://garie-ssllabs:3000",
    parseResult: (result) => result.ssl_score,
    important: true,
    database: "ssllabs",
    query: `SELECT mean("value") AS "value" FROM "ssl_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [1, 90]
  },
  {
    name: "Securityheaders.com",
    important: true,
    database: "securityheaders",
    query: `SELECT mean("value") AS "value" FROM "header_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [20, 90]
  },
  {
    name: "Securityheaders(mozilla)",
    database: "securityheaders",
    query: `SELECT mean("value") AS "value" FROM "mozilla_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [25, 70]
  },
  {
    name: "Uptime(30days)",
    important: true,
    database: "uptimerobot",
    query: `SELECT mean("value") AS "value" FROM "uptime_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [95, 99]
  },
  {
    name: "Server errors(30)",
    database: "sentry-metrics",
    query: `SELECT mean("value_30days") AS "value" FROM "ServerErrors/TotalVisits" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [95, 99]
  },
  {
    name: "JS errors(30)",
    database: "sentry-metrics",
    query: `SELECT mean("value_30days") AS "value" FROM "JsEvents/TotalVisits" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [95, 99]
  },
  {
    name: "Test coverage",
    database: "sonarqube",
    query: `SELECT mean("value") AS "value" FROM "coverage_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [30, 80]
  },
  {
    name: "Bugs",
    database: "sonarqube",
    query: `SELECT mean("value") AS "value" FROM "security_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [25, 75]
  },
  {
    name: "Vulnerabilities",
    database: "sonarqube",
    query: `SELECT mean("value") AS "value" FROM "reliability_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [25, 75]
  },
  {
    name: "Code smells",
    database: "sonarqube",
    query: `SELECT mean("value") AS "value" FROM "sqale_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [25, 75]
  },
  {
    name: "Duplication score",
    database: "sonarqube",
    query: `SELECT mean("value") AS "value" FROM "non_duplication_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [80, 95]
  },
  {
    name: "Privacyscore",
    important: true,
    database: "privacyscore",
    query: `SELECT mean("value") AS "value" FROM "privacyscore" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [50, 90]
  },
  {
    name: "Webbkoll",
    important: true,
    database: "webbkoll",
    query: `SELECT mean("value") AS "value" FROM "webbkoll" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`,
    thresholds: [50, 90]
  },
]

module.exports = metrics
