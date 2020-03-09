const metrics = [
  {
    name: "Performance",
    important: true,
    database: "lighthouse",
    measurement: "performance-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Performance"
  },
  {
    name: "Progressive Web App",
    database: "lighthouse",
    measurement: "pwa-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Progressive-Web-App"
  },
  {
    name: "Accessibility",
    database: "lighthouse",
    measurement: "accessibility-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Accessibility"
  },
  {
    name: "Best Practice",
    database: "lighthouse",
    measurement: "best-practices-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Best-Practice"
  },
  {
    name: "Seo Score",
    database: "lighthouse",
    measurement: "seo-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Seo-Score"
  },
  {
    name: "Links integrity",
    database: "linksintegrity",
    measurement: "linksintegrity",
    field: "value",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Links-integrity"
  },
  {
    name: "Encryption (TLS)",
    important: true,
    database: "ssllabs",
    measurement: "ssl_score",
    field: "value",
    thresholds: [1, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Encryption-TLS"
  },
  {
    name: "Securityheaders.com",
    important: true,
    database: "securityheaders",
    measurement: "header_score",
    field: "value",
    thresholds: [20, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Securityheaderscom"
  },
  {
    name: "Securityheaders(mozilla)",
    database: "securityheaders",
    measurement: "mozilla_score",
    field: "value",
    thresholds: [25, 70],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Securityheadersmozilla"
  },
  {
    name: "Uptime(30days)",
    important: true,
    database: "uptimerobot",
    measurement: "uptime_score",
    field: "value",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Uptime30days"
  },
  {
    name: "Server errors(30)",
    database: "sentry-metrics",
    measurement: "ServerErrors/TotalVisits",
    field: "value_30days",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Server-errorsvisit-by-Sentry"
  },
  {
    name: "JS errors(30)",
    database: "sentry-metrics",
    measurement: "JsEvents/TotalVisits",
    field: "value_30days",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#JS-errorsvisit-by-Sentry"
  },
  {
    name: "Test coverage",
    database: "sonarqube",
    measurement: "coverage_rating",
    field: "value",
    thresholds: [30, 80],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Test-coverage-JenkinsSonarqube"
  },
  {
    name: "Bugs",
    database: "sonarqube",
    measurement: "security_rating",
    field: "value",
    thresholds: [25, 75],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Bugs-JenkinsSonarqube"
  },
  {
    name: "Vulnerabilities",
    database: "sonarqube",
    measurement: "reliability_rating",
    field: "value",
    thresholds: [25, 75],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Vulnerabilities-JenkinsSonarqube"
  },
  {
    name: "Code smells",
    database: "sonarqube",
    measurement: "sqale_rating",
    field: "value",
    thresholds: [25, 75],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Code-smells-JenkinsSonarqube"
  },
  {
    name: "Duplication score",
    database: "sonarqube",
    measurement: "non_duplication_rating",
    field: "value",
    thresholds: [80, 95],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Duplication-score-JenkinsSonarqube"
  },
  {
    name: "Privacyscore",
    important: true,
    database: "privacyscore",
    measurement: "privacyscore",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Privacyscoreorg"
  },
  {
    name: "Webbkoll",
    important: true,
    database: "webbkoll",
    measurement: "webbkoll",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#webbkolldataskyddnet"
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
  {
    database: "sonarqube",
    url: "http://garie-sonarqube:3000",
  },
  {
    database: "lighthouse",
    url: "http://garie-lighthouse:3000",
  },
  {
    database: "privacyscore",
    url: "http://garie-privacyscore:3000",
  },
]

module.exports = {
  metrics,
  onDemandApis,
}
