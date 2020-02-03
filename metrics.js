const metrics = [
  {
    name: "Performance",
    database: "lighthouse",
    query: `SELECT mean("value") AS "Performance" FROM "performance-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Progressive Web App",
    database: "lighthouse",
    query: `SELECT mean("value") AS "Progressive Web App" FROM "pwa-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Accessibility",
    database: "lighthouse",
    query: `SELECT mean("value") AS "Accessibility" FROM "accessibility-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Best Practice",
    database: "lighthouse",
    query: `SELECT mean("value") AS "Best Practice" FROM "best-practices-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Seo Score",
    database: "lighthouse",
    query: `SELECT mean("value") AS "Seo Score" FROM "seo-score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Links integrity",
    database: "linksintegrity",
    query: `SELECT mean("value") AS "Links integrity" FROM "linksintegrity" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Encryption (TLS)",
    database: "ssllabs",
    query: `SELECT mean("value") AS "Encryption (TLS)" FROM "ssl_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Securityheaders.com",
    database: "securityheaders",
    query: `SELECT mean("value") AS "Securityheaders.com" FROM "header_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Securityheaders(mozilla)",
    database: "securityheaders",
    query: `SELECT mean("value") AS "Securityheaders(mozilla)" FROM "mozilla_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Uptime(30days)",
    database: "uptimerobot",
    query: `SELECT mean("value") AS "Uptime(30days)" FROM "uptime_score" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Server errors(30)",
    database: "sentry-metrics",
    query: `SELECT mean("value_30days") AS "Server errors(30)" FROM "ServerErrors/TotalVisits" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "JS errors(30)",
    database: "sentry-metrics",
    query: `SELECT mean("value_30days") AS "JS errors(30)" FROM "JsEvents/TotalVisits" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Test coverage",
    database: "sonarqube",
    query: `SELECT mean("value") AS "Test coverage" FROM "coverage_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Bugs",
    database: "sonarqube",
    query: `SELECT mean("value") AS "Bugs" FROM "security_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Vulnerabilities",
    database: "sonarqube",
    query: `SELECT mean("value") AS "Vulnerabilities" FROM "reliability_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Code smells",
    database: "sonarqube",
    query: `SELECT mean("value") AS "Code smells" FROM "sqale_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Duplication score",
    database: "sonarqube",
    query: `SELECT mean("value") AS "Duplication score" FROM "non_duplication_rating" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Privacyscore",
    database: "privacyscore",
    query: `SELECT mean("value") AS "Privacyscore" FROM "privacyscore" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
  {
    name: "Webbkoll",
    database: "webbkoll",
    query: `SELECT mean("value") AS "Webbkoll" FROM "webbkoll" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  },
]

module.exports = metrics
